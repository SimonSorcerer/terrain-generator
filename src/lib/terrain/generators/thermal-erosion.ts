import type { GeneratorParams } from '../generator';

// In-place thermal erosion pass. For each cell, excess height above the talus
// angle relative to each 4-neighbor is redistributed downhill. A delta buffer
// accumulates all transfers before applying so no cell is updated twice per
// iteration, preventing oscillation.
export function thermalErode(map: Float32Array, mapSize: number, params: GeneratorParams): void {
  const iterations = params.thermalIterations ?? 5;
  const talusAngle = params.talusAngle ?? 0.05;

  const delta = new Float32Array(map.length);

  for (let iter = 0; iter < iterations; iter++) {
    delta.fill(0);

    for (let y = 0; y < mapSize; y++) {
      for (let x = 0; x < mapSize; x++) {
        const idx = y * mapSize + x;
        const h = map[idx];

        const neighbors = [
          x > 0 ? idx - 1 : -1,
          x < mapSize - 1 ? idx + 1 : -1,
          y > 0 ? idx - mapSize : -1,
          y < mapSize - 1 ? idx + mapSize : -1,
        ] as const;

        for (const nIdx of neighbors) {
          if (nIdx === -1) continue;
          const diff = h - map[nIdx];
          if (diff > talusAngle) {
            // Transfer half the excess so neither cell overshoots.
            const transfer = (diff - talusAngle) * 0.5;
            delta[idx] -= transfer;
            delta[nIdx] += transfer;
          }
        }
      }
    }

    for (let i = 0; i < map.length; i++) {
      map[i] = Math.max(0, Math.min(1, map[i] + delta[i]));
    }
  }
}
