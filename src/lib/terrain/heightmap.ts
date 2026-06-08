import { createNoiseFn, fbmNormalized, type NoiseParams } from './noise';

// Returns a flat Float32Array of (resolution + 1)² values in [0, 1], one per
// grid vertex in row-major order (row = z-axis, col = x-axis).
// Coordinates are normalised to [0, 1] before passing to fbm so that changing
// resolution never alters the visual pattern — only params do.
// A second min/max stretch pass ensures the full [0, 1] range is always used.
export function generateHeightmap(resolution: number, params: NoiseParams): Float32Array {
  const side = resolution + 1;
  const heights = new Float32Array(side * side);
  const noise2D = createNoiseFn(params.seed);

  for (let row = 0; row < side; row++) {
    const ny = row / resolution;
    for (let col = 0; col < side; col++) {
      const nx = col / resolution;
      heights[row * side + col] = fbmNormalized(nx, ny, params, noise2D);
    }
  }

  // Stretch to fill [0, 1] so every heightmap uses the full elevation range.
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
}
