import { useState, useEffect } from 'react';
import type { Scene } from '../../../types/schema';
import { useImageGenerate } from '../../../hooks/useImageGenerate';
import useProjectStore from '../../../store/projectStore';
import api from '../../../lib/api';
import { Button } from '../../ui/Button';
import { Image, Loader, Check, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../../glass/GlassCard';
import { ImageSkeleton } from '../../skeletons/ImageSkeleton';
import { useQuery } from '@tanstack/react-query';

interface ImageTabProps {
  scene: Scene;
}

export const ImageTab = ({ scene }: ImageTabProps) => {
  const { project, updateScene } = useProjectStore();
  
  const currentScene = project?.scenes.find(s => s.scene_id === scene.scene_id);

  const { mutate: generateImage, isPending: isGenerating } = useImageGenerate();
  const [jobId, setJobId] = useState<string | null>(null);

  const { data: jobStatus, error: jobError } = useQuery<any>({ //TODO: Add type
    queryKey: ['image-status', jobId],
    queryFn: () => api.get(`/api/image/status/${jobId}`),
    enabled: !!jobId && (currentScene?.status.image === 'generating' || currentScene?.status.image === 'pending'),
    refetchInterval: (query) => (query.state.data?.status === 'done' || query.state.data?.status === 'failed') ? false : 5000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (jobStatus?.status === 'done' && currentScene && currentScene.status.image !== 'done' && jobStatus.r2Key) {
        const imageUrl = `/api/storage/presign?key=${jobStatus.r2Key}`;
        updateScene(scene.scene_id, { 
          ...currentScene,
          status: { ...currentScene.status, image: 'done' },
          assets: { ...currentScene.assets, image_url: imageUrl, image_r2_key: jobStatus.r2Key }
        });
        setJobId(null); // Clear job ID after completion
    } else if (jobStatus?.status === 'failed' && currentScene) {
        updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, image: 'failed' } });
        setJobId(null); // Clear job ID
    }
  }, [jobStatus, currentScene, updateScene, scene.scene_id]);

  const handleGenerateImage = () => {
    if (project && currentScene) {
        updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, image: 'generating' }});
        generateImage({ 
            scene: currentScene,
            projectId: project.project_id,
            imageModel: currentScene.recommended_image_model,
            awsRegion: 'us-east-1',
        }, {
            onSuccess: (data: any) => { // TODO: Add proper type
                if (data.jobId) {
                    setJobId(data.jobId);
                } else {
                    console.error("Image generation failed to start", data);
                    updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, image: 'failed' }});
                }
            },
            onError: (error) => {
                console.error("Image generation error:", error);
                if (currentScene) {
                    updateScene(currentScene.scene_id, { ...currentScene, status: { ...currentScene.status, image: 'failed' }});
                }
            }
        });
    }
  };

  const handleApprove = () => {
    if (currentScene) {
      updateScene(scene.scene_id, {
        ...currentScene,
        status: { ...currentScene.status, image: 'approved', video: 'pending' }, // Unlock video
      });
    }
  };

  const isLoading = isGenerating || currentScene?.status.image === 'generating';
  const isDone = currentScene?.status.image === 'done' || currentScene?.status.image === 'approved';

  return (
    <div className="p-2 md:p-4 space-y-4">
        <GlassCard>
            <div className="aspect-[9/16] w-full rounded-lg bg-black/20 overflow-hidden relative">
            {currentScene?.assets.image_url ? (
                <img src={currentScene.assets.image_url} alt={`Scene ${scene.scene_id}`} className="w-full h-full object-cover" />
            ) : (
                <ImageSkeleton isLoading={isLoading} />
            )}
            </div>
        </GlassCard>

        <GlassCard variant="subtle" className="p-4">
            <h3 className="text-lg font-semibold text-cream mb-2">Image Prompt</h3>
            <p className="text-sm text-text-secondary bg-black/20 p-3 rounded-md font-mono whitespace-pre-wrap">
                {currentScene?.image_prompt ? JSON.stringify(currentScene.image_prompt, null, 2) : "No prompt available."}
            </p>
        </GlassCard>
      
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button size="lg" onClick={handleGenerateImage} disabled={isLoading || isDone} className="flex-1">
                {isLoading ? <><Loader size={20} className="animate-spin mr-2"/> Generating...</> : <><Image size={20} className="mr-2"/> Generate Image</>}
            </Button>
            
            <Button size="lg" onClick={handleApprove} disabled={!isDone || currentScene?.status.image === 'approved'} variant={isDone ? 'default' : 'secondary'} className="flex-1">
                 <Check size={20} className="mr-2"/> {currentScene?.status.image === 'approved' ? 'Image Approved' : 'Approve Image'}
            </Button>
        </div>

        {currentScene?.status.image === 'failed' && (
             <GlassCard variant="destructive" className="p-4">
                <div className="flex items-center gap-3">
                    <AlertTriangle className="text-accent-orange" size={24}/>
                    <div>
                        <h4 className="font-bold text-cream">Image Generation Failed</h4>
                        <p className="text-sm text-text-secondary">{jobError?.message || 'An unknown error occurred. Check the worker logs.'}</p>
                        <Button variant="outline" size="sm" className="mt-2" onClick={handleGenerateImage}>Retry</Button>
                    </div>
                </div>
            </GlassCard>
        )}
    </div>
  );
};
