import { createNoise2D } from 'simplex-noise';

export interface NoiseParams {
  seed: number;
  scale: number;
  octaves: number;
  persistence: number;
  lacunarity: number;
}

// Mulberry32 — fast, good-quality seeded PRNG; no extra dependency needed.
// simplex-noise accepts any () => number as its random source.
function mulberry32(seed: number): () => number {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createNoiseFn(seed: number): (x: number, y: number) => number {
  return createNoise2D(mulberry32(seed));
}

// Returns a value in approximately [-maxAmplitude, +maxAmplitude].
// noise2D is created once per seed via createNoiseFn and passed in to avoid
// rebuilding the permutation table on every call.
export function fbm(
  x: number,
  y: number,
  params: NoiseParams,
  noise2D: (x: number, y: number) => number,
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;

  for (let i = 0; i < params.octaves; i++) {
    value += noise2D(x * frequency * params.scale, y * frequency * params.scale) * amplitude;
    amplitude *= params.persistence;
    frequency *= params.lacunarity;
  }

  return value;
}

// Geometric series sum: the theoretical maximum absolute value of fbm output.
function maxAmplitude(params: NoiseParams): number {
  if (params.persistence === 1) return params.octaves;
  return (1 - Math.pow(params.persistence, params.octaves)) / (1 - params.persistence);
}

// Returns a value in [0, 1] using the theoretical amplitude range for normalisation.
export function fbmNormalized(
  x: number,
  y: number,
  params: NoiseParams,
  noise2D: (x: number, y: number) => number,
): number {
  return (fbm(x, y, params, noise2D) / maxAmplitude(params) + 1) / 2;
}
