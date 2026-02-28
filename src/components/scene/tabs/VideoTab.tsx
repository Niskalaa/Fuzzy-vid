import React, { useState, useEffect } from 'react';
import { Scene } from '../../../types/schema';
import { useVideoGenerate } from '../../../hooks/useVideoGenerate';
import useProjectStore from '../../../store/projectStore';
import { GlassButton } from '../../glass/GlassButton';
import { Video, Loader } from 'lucide-react';

interface VideoTabProps {
  scene: Scene;
}

export const VideoTab: React.FC<VideoTabProps> = ({ scene }) => {
  const [jobId, setJobId] = useState<string>('');
  const { project, updateScene } = useProjectStore();
  const currentScene = project?.scenes.find(s => s.scene_id === scene.scene_id);
  const { mutate, data: videoJob, isPending } = useVideoGenerate(jobId, currentScene?.status.video || 'pending');

  useEffect(() => {
    if (videoJob?.status === 'done' && currentScene?.status.video !== 'done') {
      // TODO: Get presigned URL for the video
      updateScene(scene.scene_id, { 
        ...currentScene!,
        status: { ...currentScene!.status, video: 'done' },
        assets: { ...currentScene!.assets, video_r2_key: videoJob.videoR2Key }
      });
    }
  }, [videoJob, currentScene, updateScene, scene.scene_id]);

  const handleGenerateVideo = () => {
    if (project && currentScene?.assets.image_r2_key) {
        mutate({ 
            image_r2_key: currentScene.assets.image_r2_key,
            model: scene.video_prompt.model_preference,
            project_id: project.project_id,
            scene_id: scene.scene_id,
        }, {
            onSuccess: (data) => {
                setJobId(data.jobId);
                updateScene(scene.scene_id, { 
                    ...currentScene!,
                    status: { ...currentScene!.status, video: 'generating' }
                });
            }
        });
    }
  };

  return (
    <div>
      {currentScene?.assets.video_url ? (
        <video src={currentScene.assets.video_url} className="aspect-[9/16] w-full rounded-lg" controls />
      ) : (
        <div className="aspect-[9/16] w-full rounded-lg bg-glass-01 flex items-center justify-center">
          {currentScene?.status.video === 'generating' && <Loader className="animate-spin"/>}
          {currentScene?.status.video === 'pending' && <Video/>}
        </div>
      )}

      <GlassButton onClick={handleGenerateVideo} disabled={currentScene?.status.video === 'generating' || currentScene?.status.video === 'done' || currentScene?.status.image !== 'approved'}>
        {currentScene?.status.video === 'generating' ? 'Generating Video...' : 'Generate Video'}
      </GlassButton>
    </div>
  );
};