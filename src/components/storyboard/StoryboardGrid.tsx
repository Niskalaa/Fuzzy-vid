import React from 'react';
import useProjectStore from '../../store/projectStore';
import { SceneCard } from '../scene/SceneCard';

export const StoryboardGrid: React.FC = () => {
  const { project } = useProjectStore();

  if (!project) {
    return <div>Loading project...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {project.scenes.map((scene) => (
        <SceneCard key={scene.scene_id} scene={scene} />
      ))}
    </div>
  );
};
