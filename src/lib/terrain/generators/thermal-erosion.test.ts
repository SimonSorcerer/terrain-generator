import { describe, it, expect } from 'vitest';
import { thermalErode } from './thermal-erosion';
import { hydraulicErosionGenerator } from './hydraulic-erosion';

const BASE_PARAMS = {
  seed: 5,
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
  thermalEnabled: false,
  thermalIterations: 5,
  talusAngle: 0.05,
};

describe('thermalErode', () => {
  it('keeps values in [0, 1]', () => {
    // Checkerboard of 0s and 1s — worst case for above-1 overflow since every
    // 0-cell has up to 4 high neighbours all trying to deposit simultaneously.
    const mapSize = 17;
    const map = new Float32Array(mapSize * mapSize);
    for (let i = 0; i < map.length; i++) map[i] = i % 2 === 0 ? 1 : 0;
    thermalErode(map, mapSize, { ...BASE_PARAMS, thermalIterations: 10 });
    for (let i = 0; i < map.length; i++) {
      expect(map[i]).toBeGreaterThanOrEqual(0);
      expect(map[i]).toBeLessThanOrEqual(1);
    }
  });

  it('substantially reduces steep slopes', () => {
    // Step function: left half = 1, right half = 0. The boundary column starts
    // with difference = 1.0. After thermal erosion, max slope should drop well
    // below the initial value.
    const mapSize = 17;
    const map = new Float32Array(mapSize * mapSize);
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        map[y * mapSize + x] = x < mapSize / 2 ? 1 : 0;
      }
    }
    thermalErode(map, mapSize, { ...BASE_PARAMS, thermalIterations: 50, talusAngle: 0.05 });

    let maxDiff = 0;
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize - 1; x++) {
        const diff = Math.abs(map[y * mapSize + x] - map[y * mapSize + x + 1]);
        if (diff > maxDiff) maxDiff = diff;
      }
    }
    // Initial max diff was 1.0; after erosion it should be a fraction of that.
    expect(maxDiff).toBeLessThan(0.2);
  });

  it('reduces steep slopes — variance decreases on high-contrast input', () => {
    // Same step-function input: very high local variance at the boundary.
    const mapSize = 17;
    const before = new Float32Array(mapSize * mapSize);
    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        before[y * mapSize + x] = x < mapSize / 2 ? 1 : 0;
      }
    }

    const after = new Float32Array(before);
    thermalErode(after, mapSize, { ...BASE_PARAMS, thermalIterations: 20, talusAngle: 0.05 });

    const variance = (arr: Float32Array) => {
      const mean = arr.reduce((s, v) => s + v, 0) / arr.length;
      return arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length;
    };
    expect(variance(after)).toBeLessThan(variance(before));
  });
});

describe('hydraulicErosionGenerator with thermal pass', () => {
  it('produces different output with thermalEnabled true vs false', () => {
    const without = hydraulicErosionGenerator(BASE_PARAMS);
    const with_ = hydraulicErosionGenerator({ ...BASE_PARAMS, thermalEnabled: true });
    expect(without).not.toEqual(with_);
  });

  it('is deterministic with thermalEnabled true', () => {
    const params = { ...BASE_PARAMS, thermalEnabled: true };
    expect(hydraulicErosionGenerator(params)).toEqual(hydraulicErosionGenerator(params));
  });
});
