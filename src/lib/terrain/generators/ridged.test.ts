import { describe, it, expect } from 'vitest';
import { ridgedGenerator } from './ridged';
import { simplexGenerator } from './simplex';

const BASE_PARAMS = {
  seed: 7,
  scale: 3,
  octaves: 4,
  persistence: 0.5,
  lacunarity: 2,
  resolution: 16,
  sharpness: 2,
};

describe('ridgedGenerator', () => {
  it('outputs values in [0, 1]', () => {
    const h = ridgedGenerator(BASE_PARAMS);
    for (let i = 0; i < h.length; i++) {
      expect(h[i]).toBeGreaterThanOrEqual(0);
      expect(h[i]).toBeLessThanOrEqual(1);
    }
  });

  it('produces (resolution+1)² values', () => {
    const h = ridgedGenerator(BASE_PARAMS);
    expect(h.length).toBe((BASE_PARAMS.resolution + 1) ** 2);
  });

  it('is deterministic for the same params', () => {
    expect(ridgedGenerator(BASE_PARAMS)).toEqual(ridgedGenerator(BASE_PARAMS));
  });

  it('produces different output for different seeds', () => {
    expect(ridgedGenerator(BASE_PARAMS)).not.toEqual(
      ridgedGenerator({ ...BASE_PARAMS, seed: 999 }),
    );
  });

  it('produces different output from simplex at the same seed', () => {
    expect(ridgedGenerator(BASE_PARAMS)).not.toEqual(simplexGenerator(BASE_PARAMS));
  });

  it('ridge peaks reach 1.0 after normalisation', () => {
    const h = ridgedGenerator(BASE_PARAMS);
    const max = Math.max(...h);
    expect(max).toBeCloseTo(1.0, 5);
  });

  it('higher sharpness produces fewer high-elevation pixels', () => {
    const soft = ridgedGenerator({ ...BASE_PARAMS, sharpness: 1 });
    const sharp = ridgedGenerator({ ...BASE_PARAMS, sharpness: 4 });
    const threshold = 0.8;
    const softCount = soft.filter((v) => v > threshold).length;
    const sharpCount = sharp.filter((v) => v > threshold).length;
    expect(sharpCount).toBeLessThan(softCount);
  });
});
