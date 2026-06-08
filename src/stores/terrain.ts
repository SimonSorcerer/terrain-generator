import { writable, derived } from 'svelte/store';
import { generateHeightmap } from '../lib/terrain/heightmap';
import type { NoiseParams } from '../lib/terrain/noise';

export interface WaterParams {
  waterColor: string;   // CSS hex string, e.g. '#2255aa'
  waterOpacity: number; // 0–1
  waterRoughness: number; // 0–1
}

export const DEFAULT_WATER_PARAMS: WaterParams = {
  waterColor: '#2255aa',
  waterOpacity: 0.6,
  waterRoughness: 0.1,
};

export const waterParams = writable<WaterParams>({ ...DEFAULT_WATER_PARAMS });

export interface TerrainParams extends NoiseParams {
  resolution: number;
  heightScale: number;
  seaLevel: number;
}

export const DEFAULT_PARAMS: TerrainParams = {
  seed: 42,
  scale: 3,
  octaves: 6,
  persistence: 0.5,
  lacunarity: 2,
  resolution: 128,
  heightScale: 30,
  seaLevel: 0.35,
};

export const terrainParams = writable<TerrainParams>({ ...DEFAULT_PARAMS });

// Recomputes the heightmap whenever any param changes.
export const heightmap = derived(terrainParams, ($p) =>
  generateHeightmap($p.resolution, $p),
);
