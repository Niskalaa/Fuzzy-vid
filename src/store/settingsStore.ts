import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { AppSettings, BrainModel, ImageModel, VideoModel, AudioModel, AWSRegion } from '../types/schema';

const initialSettings: AppSettings = {
  default_brain_model: 'gemini',
  gemini_api_key: '',
  bedrock_brain_region: 'us-east-1',

  default_image_model: 'gemini',
  bedrock_image_region: 'us-east-1',

  default_video_model: 'nova_reel',
  runway_api_key: '',

  default_audio_model: 'polly',
  bedrock_audio_region: 'us-east-1',
  elevenlabs_api_key: '',

  aws_access_key_id: '',
  aws_secret_access_key: '',

  r2_account_id: '',
  r2_access_key_id: '',
  r2_secret_access_key: '',

  default_narasi_language: 'en',
};

interface SettingsState extends AppSettings {
  set: (settings: Partial<AppSettings>) => void;
}

const useSettingsStore = create<SettingsState>()(
  devtools(
    persist(
      (set) => ({ ...initialSettings, set: (settings) => set((state) => ({ ...state, ...settings })) }),
      {
        name: 'fuzzy-short-settings',
      }
    )
  )
);

export default useSettingsStore;
