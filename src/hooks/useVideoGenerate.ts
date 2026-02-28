import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import useProjectStore from '../store/projectStore';
import type { VideoModel, Scene } from '../types/schema';

// --- Types ---
interface GenerateVideoParams {
  image_r2_key: string;
  model: VideoModel;
  project_id: string;
  scene_id: number;
}

interface GenerateVideoResponse {
  jobId: string;
}

interface VideoStatusResponse {
  status: 'pending' | 'generating' | 'done' | 'failed';
  r2Key?: string;
  progress?: number;
  error?: string;
}

// --- API Functions ---
const generateVideo = async (params: GenerateVideoParams): Promise<GenerateVideoResponse> => {
  return api.post('/api/video/generate', params);
};

const getVideoStatus = async (jobId: string | null): Promise<VideoStatusResponse> => {
  if (!jobId) return { status: 'pending' };
  return api.get(`/api/video/status/${jobId}`);
};

// --- Hook ---
export const useVideoGeneration = (sceneId: number) => {
  const queryClient = useQueryClient();
  const { updateScene, project } = useProjectStore();
  const [jobId, setJobId] = useState<string | null>(null);

  const scene = project?.scenes.find(s => s.scene_id === sceneId);

  const mutation = useMutation<GenerateVideoResponse, Error, GenerateVideoParams>({ 
    mutationFn: generateVideo,
    onSuccess: (data) => {
      setJobId(data.jobId);
      if (scene) {
        updateScene(sceneId, { 
          status: { ...scene.status, video: 'generating' } 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['video-status', data.jobId] });
    },
    onError: (error) => {
      console.error("Video generation failed to start:", error);
      if (scene) {
        updateScene(sceneId, { 
          status: { ...scene.status, video: 'failed' } 
        });
      }
    },
  });

  const { data: statusData, ...query } = useQuery<VideoStatusResponse, Error>({
    queryKey: ['video-status', jobId],
    queryFn: () => getVideoStatus(jobId),
    enabled: !!jobId && scene?.status.video === 'generating',
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'done' || status === 'failed') {
        return false; // Stop polling
      }
      return 30000; // Poll every 30 seconds for video
    },
    refetchIntervalInBackground: true,
    onSuccess: (data) => {
      if (data.status === 'done' && data.r2Key) {
        const presignedUrl = `/api/storage/presign?key=${data.r2Key}`;
        if (scene) {
            updateScene(sceneId, {
                status: { ...scene.status, video: 'done' },
                assets: { ...scene.assets, video_url: presignedUrl, video_r2_key: data.r2Key }
            });
        }
        setJobId(null);
      } else if (data.status === 'failed') {
        console.error('Video generation failed:', data.error);
        if (scene) {
            updateScene(sceneId, { 
              status: { ...scene.status, video: 'failed' } 
            });
        }
        setJobId(null);
      }
    },
  });

  return {
    generate: mutation.mutate,
    isStarting: mutation.isPending,
    isGenerating: query.isLoading && scene?.status.video === 'generating',
    progress: statusData?.progress,
    status: scene?.status.video,
    ...query,
  };
};
