import { createNoiseFn, fbmNormalized } from '../noise';
import type { GeneratorFn, GeneratorParams } from '../generator';

export const simplexGenerator: GeneratorFn = (params: GeneratorParams): Float32Array => {
  const side = params.resolution + 1;
  const heights = new Float32Array(side * side);
  const noise2D = createNoiseFn(params.seed);

  for (let row = 0; row < side; row++) {
    const ny = row / params.resolution;
    for (let col = 0; col < side; col++) {
      const nx = col / params.resolution;
      heights[row * side + col] = fbmNormalized(nx, ny, params, noise2D);
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
