import type { NoiseParams } from './noise';

export interface GeneratorParams extends NoiseParams {
  resolution: number;
  // Domain warping (Task 13)
  warpStrength?: number;
  warpScale?: number;
  // Ridged multifractal (Task 14)
  sharpness?: number;
  // Hydraulic erosion (Task 15)
  dropletCount?: number;
  inertia?: number;
  sedimentCapacityFactor?: number;
  depositSpeed?: number;
  erodeSpeed?: number;
  evaporateSpeed?: number;
  gravity?: number;
  erosionRadius?: number;
}

export type GeneratorFn = (params: GeneratorParams) => Float32Array;

import { simplexGenerator } from './generators/simplex';
import { domainWarpedGenerator } from './generators/domain-warped';
import { ridgedGenerator } from './generators/ridged';
import { hydraulicErosionGenerator } from './generators/hydraulic-erosion';

export const GENERATORS: Record<string, GeneratorFn> = {
  simplex: simplexGenerator,
  'domain-warped': domainWarpedGenerator,
  ridged: ridgedGenerator,
  hydraulic: hydraulicErosionGenerator,
};

export const GENERATOR_LABELS: Record<string, string> = {
  simplex: 'Simplex fBm',
  'domain-warped': 'Domain Warped',
  ridged: 'Ridged Multifractal',
  hydraulic: 'Hydraulic Erosion',
};
