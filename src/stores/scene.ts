import { writable } from 'svelte/store';

export interface SceneParams {
  fogEnabled: boolean;
  fogDensity: number;
  fogColor: string;
  sunAzimuth: number;
  sunElevation: number;
  sunIntensity: number;
}

export const DEFAULT_SCENE_PARAMS: SceneParams = {
  fogEnabled: false,
  fogDensity: 0.003,
  fogColor: '#1a1a2e',
  sunAzimuth: 45,
  sunElevation: 55,
  sunIntensity: 1.8,
};

export const sceneParams = writable<SceneParams>({ ...DEFAULT_SCENE_PARAMS });
