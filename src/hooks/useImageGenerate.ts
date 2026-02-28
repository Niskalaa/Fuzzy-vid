import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import useProjectStore from '../store/projectStore';
import type { ImageModel, Scene, AWSRegion } from '../types/schema';

// --- Types ---
interface GenerateImageParams {
  scene: Scene;
  projectId: string;
  imageModel: ImageModel;
  awsRegion: AWSRegion; // Or get from settings store
}

interface GenerateImageResponse {
  jobId: string;
}

interface ImageStatusResponse {
  status: 'pending' | 'generating' | 'done' | 'failed';
  r2Key?: string;
  error?: string;
}

// --- API Functions ---
const generateImage = async (params: GenerateImageParams): Promise<GenerateImageResponse> => {
  return api.post('/api/image/generate', params);
};

const getImageStatus = async (jobId: string | null): Promise<ImageStatusResponse> => {
  if (!jobId) return { status: 'pending' };
  return api.get(`/api/image/status/${jobId}`);
};

// --- Hook ---
export const useImageGeneration = (sceneId: number) => {
  const queryClient = useQueryClient();
  const { updateScene, project } = useProjectStore();
  const [jobId, setJobId] = useState<string | null>(null);

  const scene = project?.scenes.find(s => s.scene_id === sceneId)

  // Mutation to *start* the image generation job
  const mutation = useMutation<GenerateImageResponse, Error, GenerateImageParams>({ 
    mutationFn: generateImage,
    onSuccess: (data) => {
      setJobId(data.jobId);
      // Immediately update scene status to generating
      if(scene) {
        updateScene(sceneId, { 
          status: { ...scene.status, image: 'generating' } 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['image-status', data.jobId] });
    },
    onError: (error) => {
      console.error("Image generation failed to start:", error);
      if(scene) {
        updateScene(sceneId, { 
          status: { ...scene.status, image: 'failed' } 
        });
      }
    },
  });

  // Query to *poll* the job status
  const { data: statusData, ...query } = useQuery<ImageStatusResponse, Error>({
    queryKey: ['image-status', jobId],
    queryFn: () => getImageStatus(jobId),
    enabled: !!jobId && scene?.status.image === 'generating',
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === 'done' || status === 'failed') {
        return false; // Stop polling
      }
      return 5000; // Poll every 5 seconds
    },
    refetchIntervalInBackground: true,
    onSuccess: (data) => {
      if (data.status === 'done' && data.r2Key) {
        // On successful completion, update the scene in the store
        const presignedUrl = `/api/storage/presign?key=${data.r2Key}`;
        if(scene) {
            updateScene(sceneId, {
                status: { ...scene.status, image: 'done' },
                assets: { ...scene.assets, image_url: presignedUrl, image_r2_key: data.r2Key }
            });
        }
        setJobId(null); // Clear job ID
      } else if (data.status === 'failed') {
        // On failure, update the scene and log the error
        console.error('Image generation failed:', data.error);
        if(scene) {
            updateScene(sceneId, { 
                status: { ...scene.status, image: 'failed' } 
            });
        }
        setJobId(null); // Clear job ID
      }
    },
  });

  return {
    generate: mutation.mutate,
    isStarting: mutation.isPending,
    isGenerating: query.isLoading && scene?.status.image === 'generating',
    status: scene?.status.image,
    ...query,
  };
};
