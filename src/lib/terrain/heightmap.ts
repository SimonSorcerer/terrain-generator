import { simplexGenerator } from './generators/simplex';
import type { NoiseParams } from './noise';

export function generateHeightmap(resolution: number, params: NoiseParams): Float32Array {
  return simplexGenerator({ ...params, resolution });
}
