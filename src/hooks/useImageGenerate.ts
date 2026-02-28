import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ImageModel } from '../types/schema';

interface GenerateImageProps {
  image_prompt: string;
  model: ImageModel;
}

interface ImageJob {
    jobId: string;
}

const generateImage = async (props: GenerateImageProps): Promise<ImageJob> => {
  return api.post('/api/image/generate', props);
};

const getImageStatus = async (jobId: string) => {
    if (!jobId) return { status: 'pending' };
    return api.get(`/api/image/status/${jobId}`);
}

export const useImageGenerate = (jobId: string, status: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: generateImage,
    onSuccess: (data) => {
      queryClient.setQueryData(['image-status', data.jobId], { status: 'generating' });
    }
  });

  const { data, ...rest } = useQuery({
    queryKey: ['image-status', jobId],
    queryFn: () => getImageStatus(jobId),
    enabled: !!jobId && (status === 'generating' || status === 'pending'),
    refetchInterval: (data: any) => {
      if (data?.status === 'done' || data?.status === 'failed') return false;
      return 5000; // 5s
    },
    refetchIntervalInBackground: true,
  });

  return { ...mutation, ...rest, data };
};
