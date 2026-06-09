import { createNoiseFn, fbm, fbmNormalized } from '../noise';
import type { GeneratorFn, GeneratorParams } from '../generator';

export const domainWarpedGenerator: GeneratorFn = (params: GeneratorParams): Float32Array => {
  const warpStrength = params.warpStrength ?? 0.5;
  const warpScale = params.warpScale ?? 1.0;

  const side = params.resolution + 1;
  const heights = new Float32Array(side * side);

  const mainNoise = createNoiseFn(params.seed);
  // Offset seed so warp and main noise are independent patterns.
  const warpNoise = createNoiseFn(params.seed + 1);

  for (let row = 0; row < side; row++) {
    const ny = row / params.resolution;
    for (let col = 0; col < side; col++) {
      const nx = col / params.resolution;

      // Two independent fBm calls from the same warp noise via coordinate
      // displacement (Quilez's technique) — avoids a third PRNG seed.
      const dx = fbm(nx * warpScale, ny * warpScale, params, warpNoise);
      const dy = fbm(nx * warpScale + 5.2, ny * warpScale + 1.3, params, warpNoise);

      heights[row * side + col] = fbmNormalized(
        nx + dx * warpStrength,
        ny + dy * warpStrength,
        params,
        mainNoise,
      );
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
