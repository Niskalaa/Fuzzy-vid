import React, { useState, useEffect } from 'react';
import { Scene } from '../../../types/schema';
import { useImageGenerate } from '../../../hooks/useImageGenerate';
import useProjectStore from '../../../store/projectStore';
import api from '../../../lib/api';
import { GlassButton } from '../../glass/GlassButton';
import { Image, Loader, Check } from 'lucide-react';

interface ImageTabProps {
  scene: Scene;
}

export const ImageTab: React.FC<ImageTabProps> = ({ scene }) => {
  const [jobId, setJobId] = useState<string>('');
  const { project, updateScene } = useProjectStore();
  const currentScene = project?.scenes.find(s => s.scene_id === scene.scene_id);
  const { mutate, data: imageJob } = useImageGenerate(jobId, currentScene?.status.image || 'pending');

  useEffect(() => {
    if (imageJob?.status === 'done' && currentScene?.status.image !== 'done' && imageJob.imageR2Key) {
      api.get(`/api/storage/presign?key=${imageJob.imageR2Key}`).then(res => {
        updateScene(scene.scene_id, { 
          ...currentScene!,
          status: { ...currentScene!.status, image: 'done' },
          assets: { ...currentScene!.assets, image_url: res.signedUrl, image_r2_key: imageJob.imageR2Key }
        });
      });
    }
  }, [imageJob, currentScene, updateScene, scene.scene_id]);

  const handleGenerateImage = () => {
    if (project) {
        mutate({ 
            image_prompt: scene.image_prompt.subject.main, // Simplified for now
            model: scene.recommended_image_model 
        }, {
            onSuccess: (data) => {
                setJobId(data.jobId);
                updateScene(scene.scene_id, { 
                    ...currentScene!,
                    status: { ...currentScene!.status, image: 'generating' }
                });
            }
        });
    }
  };

  const handleApprove = () => {
    updateScene(scene.scene_id, {
      ...currentScene!,
      status: { ...currentScene!.status, image: 'approved', video: 'pending' }, // Unlock video
    });
  };

  return (
    <div>
      {currentScene?.assets.image_url ? (
        <img src={currentScene.assets.image_url} alt={`Scene ${scene.scene_id}`} className="aspect-[9/16] w-full rounded-lg" />
      ) : (
        <div className="aspect-[9/16] w-full rounded-lg bg-glass-01 flex items-center justify-center">
          {currentScene?.status.image === 'generating' && <Loader className="animate-spin"/>}
          {currentScene?.status.image === 'pending' && <Image/>}
        </div>
      )}

      {currentScene?.status.image !== 'approved' && (
        <GlassButton onClick={handleGenerateImage} disabled={currentScene?.status.image === 'generating' || currentScene?.status.image === 'done'}>
          {currentScene?.status.image === 'generating' ? 'Generating...' : 'Generate Image'}
        </GlassButton>
      )}

      {currentScene?.status.image === 'done' && (
        <GlassButton onClick={handleApprove} className="mt-2 bg-green-500/20 hover:bg-green-500/30 border-green-500/30">
          <Check className="mr-2"/> Approve Image
        </GlassButton>
      )}
    </div>
  );
};
