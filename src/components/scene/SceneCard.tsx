import React from 'react';
import { Scene } from '../../../types/schema';
import useProjectStore from '../../../store/projectStore';
import { GlassCard } from '../../glass/GlassCard';
import { ImageTab } from './tabs/ImageTab';
import { VideoTab } from './tabs/VideoTab';

interface SceneCardProps {
  scene: Scene;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene }) => {
  const { project } = useProjectStore();
  const currentScene = project?.scenes.find(s => s.scene_id === scene.scene_id);
  const [activeTab, setActiveTab] = React.useState('image');

  return (
    <GlassCard>
      <div className="p-4">
        <h3 className="text-lg font-semibold">Scene {scene.scene_id}: {scene.title}</h3>
        <p className="text-sm text-text-secondary">{scene.narrative_voiceover.text_en}</p>

        <div className="flex space-x-2 mt-4 border-b border-glass-border-01 mb-4">
            <button 
                onClick={() => setActiveTab('image')}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'image' ? 'text-accent-orange border-b-2 border-accent-orange' : 'text-text-secondary'}`}>
                Image
            </button>
            <button 
                onClick={() => setActiveTab('video')}
                disabled={currentScene?.status.image !== 'approved' && currentScene?.status.video !== 'done'}
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'video' ? 'text-accent-orange border-b-2 border-accent-orange' : 'text-text-secondary'} disabled:opacity-50`}>
                Video
            </button>
            <button 
                // onClick={() => setActiveTab('audio')}
                disabled
                className={`px-4 py-2 text-sm font-medium ${activeTab === 'audio' ? 'text-accent-orange border-b-2 border-accent-orange' : 'text-text-secondary'} disabled:opacity-50`}>
                Audio
            </button>
        </div>

        {activeTab === 'image' && <ImageTab scene={scene} />}
        {activeTab === 'video' && <VideoTab scene={scene} />}
      </div>
    </GlassCard>
  );
};

export default SceneCard;
