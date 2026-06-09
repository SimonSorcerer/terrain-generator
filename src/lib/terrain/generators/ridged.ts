import { createNoiseFn } from '../noise';
import type { GeneratorFn, GeneratorParams } from '../generator';

export const ridgedGenerator: GeneratorFn = (params: GeneratorParams): Float32Array => {
  const sharpness = params.sharpness ?? 2;

  const side = params.resolution + 1;
  const heights = new Float32Array(side * side);
  const noise2D = createNoiseFn(params.seed);

  // Precompute max possible amplitude so the raw sum can be normalised before
  // the min/max stretch pass. Each octave contributes at most `amplitude` since
  // ridgedNoise ∈ [0, 1].
  let maxAmp = 0;
  let amp = 1;
  for (let i = 0; i < params.octaves; i++) {
    maxAmp += amp;
    amp *= params.persistence;
  }

  for (let row = 0; row < side; row++) {
    const ny = row / params.resolution;
    for (let col = 0; col < side; col++) {
      const nx = col / params.resolution;

      let value = 0;
      let amplitude = 1;
      let frequency = 1;

      for (let i = 0; i < params.octaves; i++) {
        const n = noise2D(nx * frequency * params.scale, ny * frequency * params.scale);
        value += Math.pow(1 - Math.abs(n), sharpness) * amplitude;
        amplitude *= params.persistence;
        frequency *= params.lacunarity;
      }

      heights[row * side + col] = value / maxAmp;
    }
  }

  let min = heights[0];
  let max = heights[0];
  for (let i = 1; i < heights.length; i++) {
    if (heights[i] < min) min = heights[i];
    if (heights[i] > max) max = heights[i];
  }
  const range = max - min;
  if (range > 0) {
    for (let i = 0; i < heights.length; i++) {
      heights[i] = (heights[i] - min) / range;
    }
  }

  return heights;
};
