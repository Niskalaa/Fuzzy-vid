import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Scene, AudioConfig } from '../types/schema';

interface AudioGenerationParams {
  scene: Scene;
  projectId: string;
  audioConfig: AudioConfig;
}

async function generateAudio(params: AudioGenerationParams): Promise<{ jobId: string }> {
  return api.post('/api/audio/generate', params);
}

export function useAudioGenerate() {
  return useMutation({
    mutationFn: generateAudio,
  });
}
