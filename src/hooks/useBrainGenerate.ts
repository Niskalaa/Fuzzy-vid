import { useMutation } from '@tanstack/react-query';
import api from '../lib/api';
import useProjectStore from '../store/projectStore';
import { ProjectSchema } from '../types/schema';

interface GenerateBrainProps {
  prompt: string;
  model: string;
  narasi_language: 'id' | 'en';
}

const generateBrain = async (props: GenerateBrainProps): Promise<ProjectSchema> => {
  return api.post('/api/brain/generate', props);
};

export const useBrainGenerate = () => {
  const setProject = useProjectStore((state) => state.setProject);

  return useMutation({
    mutationFn: generateBrain,
    onSuccess: (data) => {
      setProject(data);
    },
  });
};
