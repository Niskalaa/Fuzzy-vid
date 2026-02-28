import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useProjectStore from '../../../store/projectStore';
import useSettingsStore from '../../../store/settingsStore';
import { useAudioGenerate } from '../../../hooks/useAudioGenerate';
import { GlassCard } from '../../glass/GlassCard';
import { Button } from '../../ui/Button';
import { SegmentedControl } from '../../ui/SegmentedControl';
import { Languages, Download, Copy, CheckCircle, Waves, Loader, AlertTriangle } from 'lucide-react';
import api from '../../../lib/api';
import type { AudioModel, VoiceGender, Scene } from '../../../types/schema';

const voiceMap = {
  polly: {
    'en': [
      { id: 'Joanna', gender: 'female' as VoiceGender, name: 'Joanna' },
      { id: 'Matthew', gender: 'male' as VoiceGender, name: 'Matthew' },
      { id: 'Salli', gender: 'female' as VoiceGender, name: 'Salli' },
      { id: 'Justin', gender: 'male' as VoiceGender, name: 'Justin' },
    ],
    'id': [
      { id: 'Gadis', gender: 'female' as VoiceGender, name: 'Gadis (Neural)' },
    ],
  },
  gemini_tts: {
    'en': [
      { id: 'en-US-Studio-M', gender: 'male' as VoiceGender, name: 'Studio Male' },
      { id: 'en-US-Studio-F', gender: 'female' as VoiceGender, name: 'Studio Female' },
      { id: 'en-US-Wavenet-A', gender: 'female' as VoiceGender, name: 'Wavenet A' },
      { id: 'en-US-Wavenet-B', gender: 'male' as VoiceGender, name: 'Wavenet B' },
    ],
    'id': [
        { id: 'id-ID-Wavenet-A', gender: 'female' as VoiceGender, name: 'Wavenet A' },
        { id: 'id-ID-Wavenet-B', gender: 'male' as VoiceGender, name: 'Wavenet B' },
    ]
  },
  elevenlabs: {
    'en': [],
    'id': []
  }
};

const WaveformPlayer = ({ src }: { src: string }) => (
    <div className="w-full h-24 bg-black/30 rounded-lg flex items-center justify-center relative group">
        <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
            <div className="h-12 w-full bg-gradient-to-r from-accent-blue/30 via-accent-orange/40 to-accent-blue/30 opacity-70 group-hover:opacity-100 transition-opacity"
                 style={{ clipPath: 'polygon(0 50%, 2% 42%, 4% 58%, 6% 48%, 8% 52%, 10% 60%, 12% 40%, 14% 55%, 16% 45%, 18% 58%, 20% 42%, 22% 62%, 24% 52%, 26% 48%, 28% 55%, 30% 65%, 32% 35%, 34% 58%, 36% 42%, 38% 60%, 40% 50%, 42% 55%, 44% 45%, 46% 60%, 48% 40%, 50% 62%, 52% 48%, 54% 52%, 56% 58%, 58% 45%, 60% 55%, 62% 62%, 64% 38%, 66% 58%, 68% 45%, 70% 55%, 72% 50%, 74% 48%, 76% 58%, 78% 42%, 80% 60%, 82% 50%, 84% 45%, 86% 55%, 88% 40%, 90% 60%, 92% 52%, 94% 48%, 96% 54%, 98% 46%, 100% 50%)' }} />
        </div>
      <audio controls src={src} className="w-full relative opacity-80" />
    </div>
);

const AudioTab = ({ scene }: { scene: Scene }) => {
  const queryClient = useQueryClient();
  const { project, updateScene } = useProjectStore();
  const settings = useSettingsStore();
  
  const [narasiLang, setNarasiLang] = useState<'id' | 'en'>(project?.metadata.narasi_language || 'en');
  const [narasiText, setNarasiText] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [audioModel, setAudioModel] = useState<AudioModel>(settings.default_audio_model);
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female');
  const [voiceCharacter, setVoiceCharacter] = useState<string | undefined>();

  const { mutate: generateAudio, isPending: isGenerating } = useAudioGenerate();
  const [jobId, setJobId] = useState<string | null>(null);

  const availableVoices = useMemo(() => {
    if (audioModel === 'elevenlabs') return [];
    return voiceMap[audioModel][narasiLang].filter(v => v.gender === voiceGender);
  }, [audioModel, narasiLang, voiceGender]);

  useEffect(() => {
    if (scene) {
      const text = narasiLang === 'id' ? scene.narrative_voiceover.text_id : scene.narrative_voiceover.text_en;
      setNarasiText(text);
    }
  }, [scene, narasiLang]);

  useEffect(() => {
    if (availableVoices.length > 0) {
        setVoiceCharacter(availableVoices[0].id);
    } else {
        setVoiceCharacter(undefined);
    }
  }, [availableVoices]);

  const { data: jobStatus, error: jobError } = useQuery<any>({ //TODO: Add type
    queryKey: ['audio-status', jobId],
    queryFn: () => api.get(`/api/audio/status/${jobId}`),
    enabled: !!jobId && (scene.status.audio === 'generating' || scene.status.audio === 'pending'),
    refetchInterval: (query) => (query.state.data?.status === 'done' || query.state.data?.status === 'failed') ? false : 2500,
  });

  useEffect(() => {
    if (jobStatus?.status === 'done' && scene) {
      const audioUrl = `/api/storage/presign?key=${jobStatus.r2Key}`;
      updateScene(scene.scene_id, { 
        assets: { ...scene.assets, audio_url: audioUrl, audio_r2_key: jobStatus.r2Key },
        status: { ...scene.status, audio: 'done' }
      });
      setJobId(null);
      queryClient.invalidateQueries({ queryKey: ['project', project?.project_id] });
    } else if (jobStatus?.status === 'failed' && scene) {
        updateScene(scene.scene_id, { ...scene, status: { ...scene.status, audio: 'failed' } });
        setJobId(null);
    }
  }, [jobStatus, scene, updateScene, project?.project_id, queryClient]);

  const handleGenerate = () => {
    if (!scene || !project || !voiceCharacter) return;
    
    const audioConfig = {
        preferred_model: audioModel,
        voice_gender: voiceGender,
        voice_character: voiceCharacter,
        speed: speed,
        language: narasiLang,
    };

    updateScene(scene.scene_id, { ...scene, status: { ...scene.status, audio: 'generating' } });

    const updatedScene = { ...scene, narrative_voiceover: { ...scene.narrative_voiceover, text_en: narasiLang === 'en' ? narasiText : scene.narrative_voiceover.text_en, text_id: narasiLang === 'id' ? narasiText : scene.narrative_voiceover.text_id }};

    generateAudio({ 
        scene: updatedScene,
        projectId: project.project_id,
        audioConfig,
        awsRegion: settings.bedrock_audio_region 
    }, {
        onSuccess: (data: any) => setJobId(data.jobId), //TODO: Add type
        onError: () => {
            if(scene) updateScene(scene.scene_id, { ...scene, status: { ...scene.status, audio: 'failed' } });
        }
    });
  };

  if (!scene) return <div className="p-8 text-center text-text-muted">Please select a scene to manage audio.</div>;
  if (scene.status.video !== 'approved') return <div className="p-8 text-center text-text-muted">Please approve the video for this scene to unlock audio generation.</div>

  const isLoading = isGenerating || scene.status.audio === 'generating' || scene.status.audio === 'pending';
  const isDone = scene.status.audio === 'done' || scene.status.audio === 'approved';

  return (
    <div className="p-2 md:p-4 space-y-4">
      <GlassCard variant="subtle" className="p-4">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-cream">Narasi Voiceover</h3>
            <Button variant="ghost" size="sm" onClick={() => setNarasiLang(l => l === 'en' ? 'id' : 'en')} className="flex items-center gap-2">
                <Languages size={16}/><span>{narasiLang.toUpperCase()}</span>
            </Button>
        </div>
        <textarea value={narasiText} onChange={e => setNarasiText(e.target.value)} className="w-full h-28 p-2 rounded-lg bg-black/20 text-cream border border-glass-border-01 focus:border-accent-orange focus:ring-0 transition-colors"/>
      </GlassCard>
      
      <GlassCard variant="subtle" className="p-4 space-y-4">
        <h3 className="text-lg font-semibold text-cream">Audio Settings</h3>
        
        <div>
            <label className="text-sm text-text-secondary mb-2 block">AI Model</label>
            <SegmentedControl options={[{label: 'Polly', value: 'polly'}, {label: 'Gemini', value: 'gemini_tts'}, {label: 'ElevenLabs', value: 'elevenlabs'}]} value={audioModel} onChange={(val: string) => setAudioModel(val as AudioModel)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="text-sm text-text-secondary mb-2 block">Voice Gender</label>
                <SegmentedControl options={[{label: 'Female', value: 'female'}, {label: 'Male', value: 'male'}]} value={voiceGender} onChange={(val: string) => setVoiceGender(val as VoiceGender)} />
            </div>
            <div>
                <label className="text-sm text-text-secondary mb-2 block">Voice Character</label>
                <select value={voiceCharacter} onChange={e => setVoiceCharacter(e.target.value)} disabled={!availableVoices.length} className="w-full p-2 rounded-lg bg-black/20 text-cream border border-glass-border-01 focus:border-accent-orange focus:ring-0 transition-colors">
                    {availableVoices.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    {audioModel === 'elevenlabs' && <option value="">User-defined in Settings</option>}
                </select>
            </div>
        </div>

        <div>
            <label className="text-sm text-text-secondary mb-2 block">Speed</label>
            <div className="flex items-center gap-4">
                <input type="range" min="0.7" max="1.3" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full accent-accent-orange"/>
                <span className="text-sm text-text-primary font-mono w-12">{speed.toFixed(1)}x</span>
            </div>
        </div>
      </GlassCard>
      
      <div className="flex justify-center pt-2">
        <Button size="lg" onClick={handleGenerate} disabled={isLoading || !voiceCharacter} className="w-full max-w-sm">
            {isLoading ? <><Loader size={20} className="animate-spin mr-2"/> Generating Audio...</> : <><Waves size={20} className="mr-2"/> Generate Voiceover</>}
        </Button>
      </div>

      {jobError && (
        <GlassCard variant="destructive" className="p-4">
            <div className="flex items-center gap-3">
                <AlertTriangle className="text-accent-orange" size={24}/>
                <div>
                    <h4 className="font-bold text-cream">Audio Generation Failed</h4>
                    <p className="text-sm text-text-secondary">{(jobError as any).message || 'An unknown error occurred.'}</p>
                </div>
            </div>
        </GlassCard>
      )}

      {isDone && scene.assets.audio_url && (
        <GlassCard variant="strong" className="p-4 space-y-4 mt-6">
            <h3 className="text-lg font-semibold text-cream">Final Audio</h3>
            <WaveformPlayer src={scene.assets.audio_url} />
            <div className="grid grid-cols-2 gap-3 pt-2">
                <Button variant="secondary" onClick={() => window.open(scene.assets.audio_url, '_blank')}><Download size={16} className="mr-2"/> Download</Button>
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(narasiText)}><Copy size={16} className="mr-2"/> Copy Text</Button>
            </div>
            <div className="pt-2">
                <Button variant="default" onClick={() => updateScene(scene.scene_id, { ...scene, status: { ...scene.status, audio: 'approved' }})} className="w-full" disabled={scene.status.audio === 'approved'}>
                    <CheckCircle size={20} className="mr-2"/> {scene.status.audio === 'approved' ? 'Audio Approved' : 'Approve Audio'}
                </Button>
            </div>
        </GlassCard>
      )}
    </div>
  );
};

export default AudioTab;
