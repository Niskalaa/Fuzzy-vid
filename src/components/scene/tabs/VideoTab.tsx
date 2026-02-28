import { useState, useEffect } from 'react';
import type { Scene } from '../../../types/schema';
import { useVideoGenerate } from '../../../hooks/useVideoGenerate';
import useProjectStore from '../../../store/projectStore';
import { Button } from '../../ui/Button';
import { Video, Loader, Check, AlertTriangle, Download } from 'lucide-react';
import api from '../../../lib/api';
import { GlassCard } from '../../glass/GlassCard';
import { VideoProgressBar } from '../../skeletons/VideoProgressBar';
import { useQuery } from '@tanstack/react-query';

interface VideoTabProps {
  scene: Scene;
}

export const VideoTab = ({ scene }: VideoTabProps) => {
  const { project, updateScene } = useProjectStore();
  const currentScene = project?.scenes.find(s => s.scene_id === scene.scene_id);

  const { mutate: generateVideo, isPending: isGenerating } = useVideoGenerate();
  const [jobId, setJobId] = useState<string | null>(null);

  const { data: jobStatus, error: jobError } = useQuery<any>({ //TODO: Add type
    queryKey: ['video-status', jobId],
    queryFn: () => api.get(`/api/video/status/${jobId}`),
    enabled: !!jobId && (currentScene?.status.video === 'generating' || currentScene?.status.video === 'pending'),
    refetchInterval: (query) => (query.state.data?.status === 'done' || query.state.data?.status === 'failed') ? false : 15000, // Poll every 15s for video
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (jobStatus?.status === 'done' && currentScene && currentScene.status.video !== 'done' && jobStatus.r2Key) {
      const videoUrl = `/api/storage/presign?key=${jobStatus.r2Key}`;
      updateScene(scene.scene_id, { 
        ...currentScene,
        status: { ...currentScene.status, video: 'done' },
        assets: { ...currentScene.assets, video_url: videoUrl, video_r2_key: jobStatus.r2Key }
      });
      setJobId(null);
    } else if (jobStatus?.status === 'failed' && currentScene) {
        updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, video: 'failed' } });
        setJobId(null);
    }
  }, [jobStatus, currentScene, updateScene, scene.scene_id]);


  const handleGenerateVideo = () => {
    if (project && currentScene?.assets.image_r2_key) {
        updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, video: 'generating' }});
        generateVideo({ 
            image_r2_key: currentScene.assets.image_r2_key,
            model: scene.video_prompt.model_preference,
            project_id: project.project_id,
            scene_id: scene.scene_id,
        }, {
            onSuccess: (data: any) => {
                if (data.jobId) {
                    setJobId(data.jobId);
                } else {
                    console.error('Video generation failed to start', data);
                    updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, video: 'failed' }});
                }
            },
            onError: (error) => {
                console.error('Video generation error:', error);
                if (currentScene) {
                    updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, video: 'failed' }});
                }
            }
        });
    }
  };

  const handleApprove = () => {
    if (currentScene) {
      updateScene(scene.scene_id, {
        ...currentScene,
        status: { ...currentScene.status, video: 'approved', audio: 'pending' }, // Unlock audio
      });
    }
  };

  if (currentScene?.status.image !== 'approved') {
      return (
        <div className="p-8 text-center text-text-muted">
            Please approve the image for this scene to unlock video generation.
        </div>
      )
  }

  const isLoading = isGenerating || currentScene?.status.video === 'generating';
  const isDone = currentScene?.status.video === 'done' || currentScene?.status.video === 'approved';

  return (
    <div className="p-2 md:p-4 space-y-4">
        <GlassCard>
            <div className="aspect-[9/16] w-full rounded-lg bg-black/20 overflow-hidden relative">
            {currentScene?.assets.video_url ? (
                <video src={currentScene.assets.video_url} className="w-full h-full object-cover" controls playsInline autoPlay muted loop/>
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    {isLoading ? 
                        <VideoProgressBar progress={jobStatus?.progress || 0} /> :
                        <Video size={48} className="text-text-muted"/>
                    }
                </div>
            )}
            </div>
        </GlassCard>

        <GlassCard variant="subtle" className="p-4">
            <h3 className="text-lg font-semibold text-cream mb-2">Video Prompt</h3>
             <p className="text-sm text-text-secondary bg-black/20 p-3 rounded-md font-mono whitespace-pre-wrap">
                {currentScene?.video_prompt ? JSON.stringify(currentScene.video_prompt, null, 2) : "No prompt available."}
            </p>
        </GlassCard>
      
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button size="lg" onClick={handleGenerateVideo} disabled={isLoading || isDone} className="flex-1">
                {isLoading ? <><Loader size={20} className="animate-spin mr-2"/> Generating Video...</> : <><Video size={20} className="mr-2"/> Generate Video</>}
            </Button>
            
            <Button size="lg" onClick={handleApprove} disabled={!isDone || currentScene?.status.video === 'approved'} variant={isDone ? 'default' : 'secondary'} className="flex-1">
                 <Check size={20} className="mr-2"/> {currentScene?.status.video === 'approved' ? 'Video Approved' : 'Approve Video'}
            </Button>
        </div>

        {isDone && currentScene.assets.video_url && (
             <GlassCard variant="strong" className="p-3">
                <Button variant="outline" size="sm" className="w-full" onClick={() => window.open(currentScene.assets.video_url, '_blank')}>
                    <Download size={16} className="mr-2" />
                    Download Video
                </Button>
            </GlassCard>
        )}

        {currentScene?.status.video === 'failed' && (
             <GlassCard variant="destructive" className="p-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="text-accent-orange" size={24}/>
                    <div>
                        <h4 className="font-bold text-cream">Video Generation Failed</h4>
                        <p className="text-sm text-text-secondary">{jobError?.message || 'An unknown error occurred. Check the worker logs.'}</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={handleGenerateVideo}>Retry</Button>
                    </div>
                </div>
            </GlassCard>
        )}
    </div>
  );
};
