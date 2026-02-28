import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ProjectSchema, Scene } from '../types/schema';

interface ProjectState {
  project: ProjectSchema | null;
  setProject: (project: ProjectSchema) => void;
  updateScene: (sceneId: number, scene: Partial<Scene>) => void;
}

const useProjectStore = create<ProjectState>()(
  devtools(
    (set) => ({
      project: null,
      setProject: (project) => set({ project }),
      updateScene: (sceneId, sceneUpdate) =>
        set((state) => {
          if (!state.project) return {};
          const newScenes = state.project.scenes.map((scene) =>
            scene.scene_id === sceneId ? { ...scene, ...sceneUpdate } : scene
          );
          return {
            project: {
              ...state.project,
              scenes: newScenes,
            },
          };
        }),
    }),
    { name: 'ProjectStore' }
  )
);

export default useProjectStore;
