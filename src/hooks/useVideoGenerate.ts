import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { VideoModel } from '../types/schema';

interface GenerateVideoProps {
  image_r2_key: string;
  model: VideoModel;
  project_id: string;
  scene_id: number;
}

interface VideoJob {
    jobId: string;
}

const generateVideo = async (props: GenerateVideoProps): Promise<VideoJob> => {
  return api.post('/api/video/generate', props);
};

const getVideoStatus = async (jobId: string) => {
    if (!jobId) return { status: 'pending' };
    return api.get(`/api/video/status/${jobId}`);
}

export const useVideoGenerate = (jobId: string, status: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: generateVideo,
    onSuccess: (data) => {
      queryClient.setQueryData(['video-status', data.jobId], { status: 'generating' });
    }
  });

  const { data, ...rest } = useQuery({
    queryKey: ['video-status', jobId],
    queryFn: () => getVideoStatus(jobId),
    enabled: !!jobId && (status === 'generating' || status === 'pending'),
    refetchInterval: (data: any) => {
      if (data?.status === 'done' || data?.status === 'failed') return false;
      return 30000; // 30s
    },
    refetchIntervalInBackground: true,
  });

  return { ...mutation, ...rest, data };
};
