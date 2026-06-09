import { describe, it, expect } from 'vitest';
import { hydraulicErosionGenerator } from './hydraulic-erosion';
import { simplexGenerator } from './simplex';

const BASE_PARAMS = {
  seed: 3,
  scale: 3,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2,
  resolution: 32,
  dropletCount: 500,
  erosionRadius: 2,
  inertia: 0.05,
  sedimentCapacityFactor: 4,
  depositSpeed: 0.3,
  erodeSpeed: 0.3,
  evaporateSpeed: 0.01,
  gravity: 10,
};

describe('hydraulicErosionGenerator', () => {
  it('outputs values in [0, 1]', () => {
    const h = hydraulicErosionGenerator(BASE_PARAMS);
    for (let i = 0; i < h.length; i++) {
      expect(h[i]).toBeGreaterThanOrEqual(0);
      expect(h[i]).toBeLessThanOrEqual(1);
    }
  });

  it('produces (resolution+1)² values', () => {
    const h = hydraulicErosionGenerator(BASE_PARAMS);
    expect(h.length).toBe((BASE_PARAMS.resolution + 1) ** 2);
  });

  it('is deterministic for the same params', () => {
    expect(hydraulicErosionGenerator(BASE_PARAMS)).toEqual(
      hydraulicErosionGenerator(BASE_PARAMS),
    );
  });

  it('produces different output for different seeds', () => {
    expect(hydraulicErosionGenerator(BASE_PARAMS)).not.toEqual(
      hydraulicErosionGenerator({ ...BASE_PARAMS, seed: 999 }),
    );
  });

  it('produces different output from the base simplex heightmap', () => {
    const eroded = hydraulicErosionGenerator(BASE_PARAMS);
    const plain = simplexGenerator(BASE_PARAMS);
    expect(eroded).not.toEqual(plain);
  });

  it('carves valleys — some cells are lower than the base simplex', () => {
    const eroded = hydraulicErosionGenerator(BASE_PARAMS);
    const plain = simplexGenerator(BASE_PARAMS);
    // After normalisation both have max=1 and min=0, but the distributions differ.
    // At least one cell should be strictly lower in the eroded version.
    const lowerCount = Array.from(eroded).filter((v, i) => v < plain[i]).length;
    expect(lowerCount).toBeGreaterThan(0);
  });

  it('more droplets produce greater deviation from the base', () => {
    const few = hydraulicErosionGenerator({ ...BASE_PARAMS, dropletCount: 100 });
    const many = hydraulicErosionGenerator({ ...BASE_PARAMS, dropletCount: 2000 });
    const plain = simplexGenerator(BASE_PARAMS);

    const diffFew = few.reduce((s, v, i) => s + Math.abs(v - plain[i]), 0);
    const diffMany = many.reduce((s, v, i) => s + Math.abs(v - plain[i]), 0);
    expect(diffMany).toBeGreaterThan(diffFew);
  });
});
