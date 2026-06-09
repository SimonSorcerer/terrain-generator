import { writable, derived } from 'svelte/store';
import { GENERATORS } from '../lib/terrain/generator';
import type { GeneratorParams } from '../lib/terrain/generator';

export interface WaterParams {
    waterColor: string;
    waterOpacity: number;
    waterRoughness: number;
}

export const DEFAULT_WATER_PARAMS: WaterParams = {
    waterColor: '#2255aa',
    waterOpacity: 0.6,
    waterRoughness: 0.1,
};

export const waterParams = writable<WaterParams>({ ...DEFAULT_WATER_PARAMS });

export interface TerrainParams extends GeneratorParams {
    heightScale: number;
    seaLevel: number;
    generatorType: string;
    warpStrength: number;
    warpScale: number;
    sharpness: number;
    dropletCount: number;
    inertia: number;
    sedimentCapacityFactor: number;
    depositSpeed: number;
    erodeSpeed: number;
    evaporateSpeed: number;
    gravity: number;
    erosionRadius: number;
    thermalEnabled: boolean;
    thermalIterations: number;
    talusAngle: number;
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
    generatorType: 'simplex',
    warpStrength: 0.5,
    warpScale: 1.0,
    sharpness: 2,
    dropletCount: 50_000,
    inertia: 0.05,
    sedimentCapacityFactor: 4,
    depositSpeed: 0.3,
    erodeSpeed: 0.3,
    evaporateSpeed: 0.01,
    gravity: 10,
    erosionRadius: 3,
    thermalEnabled: false,
    thermalIterations: 25,
    talusAngle: 0.03,
};

export const terrainParams = writable<TerrainParams>({ ...DEFAULT_PARAMS });

export const heightmap = derived(terrainParams, ($p) => {
    const generator = GENERATORS[$p.generatorType] ?? GENERATORS['simplex'];
    return generator($p);
});
