import { describe, it, expect } from 'vitest';
import { domainWarpedGenerator } from './domain-warped';
import { simplexGenerator } from './simplex';

const BASE_PARAMS = {
  seed: 1,
  scale: 3,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2,
  resolution: 16,
  warpStrength: 0.8,
  warpScale: 1.0,
};

describe('domainWarpedGenerator', () => {
  it('outputs values in [0, 1]', () => {
    const h = domainWarpedGenerator(BASE_PARAMS);
    for (let i = 0; i < h.length; i++) {
      expect(h[i]).toBeGreaterThanOrEqual(0);
      expect(h[i]).toBeLessThanOrEqual(1);
    }
  });

  it('produces (resolution+1)² values', () => {
    const res = BASE_PARAMS.resolution;
    const h = domainWarpedGenerator(BASE_PARAMS);
    expect(h.length).toBe((res + 1) * (res + 1));
  });

  it('is deterministic for the same params', () => {
    const a = domainWarpedGenerator(BASE_PARAMS);
    const b = domainWarpedGenerator(BASE_PARAMS);
    expect(a).toEqual(b);
  });

  it('produces different output for different seeds', () => {
    const a = domainWarpedGenerator(BASE_PARAMS);
    const b = domainWarpedGenerator({ ...BASE_PARAMS, seed: 999 });
    expect(a).not.toEqual(b);
  });

  it('produces different output from simplex at the same seed', () => {
    const warped = domainWarpedGenerator(BASE_PARAMS);
    const plain = simplexGenerator(BASE_PARAMS);
    expect(warped).not.toEqual(plain);
  });

  it('matches simplex output when warpStrength is 0', () => {
    const params = { ...BASE_PARAMS, warpStrength: 0 };
    const warped = domainWarpedGenerator(params);
    const plain = simplexGenerator(params);
    for (let i = 0; i < warped.length; i++) {
      expect(warped[i]).toBeCloseTo(plain[i], 5);
    }
  });
});
