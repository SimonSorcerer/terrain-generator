import { mulberry32 } from '../noise';
import { simplexGenerator } from './simplex';
import type { GeneratorFn, GeneratorParams } from '../generator';

export const hydraulicErosionGenerator: GeneratorFn = (params: GeneratorParams): Float32Array => {
  const heights = simplexGenerator(params);
  const mapSize = params.resolution + 1;

  erode(heights, mapSize, params);

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

function erode(map: Float32Array, mapSize: number, params: GeneratorParams): void {
  const dropletCount = params.dropletCount ?? 50_000;
  const inertia = params.inertia ?? 0.05;
  const sedimentCapacityFactor = params.sedimentCapacityFactor ?? 4;
  const depositSpeed = params.depositSpeed ?? 0.3;
  const erodeSpeed = params.erodeSpeed ?? 0.3;
  const evaporateSpeed = params.evaporateSpeed ?? 0.01;
  const gravity = params.gravity ?? 10;
  const erosionRadius = params.erosionRadius ?? 3;
  const maxLifetime = 30;
  const minSlope = 0.01;

  // Build brush template once — flat parallel arrays avoid per-step allocations.
  const brushDX: number[] = [];
  const brushDY: number[] = [];
  const brushW: number[] = [];
  let wSum = 0;
  for (let dy = -erosionRadius; dy <= erosionRadius; dy++) {
    for (let dx = -erosionRadius; dx <= erosionRadius; dx++) {
      const d2 = dx * dx + dy * dy;
      if (d2 < erosionRadius * erosionRadius) {
        const w = 1 - Math.sqrt(d2) / erosionRadius;
        brushDX.push(dx);
        brushDY.push(dy);
        brushW.push(w);
        wSum += w;
      }
    }
  }
  for (let i = 0; i < brushW.length; i++) brushW[i] /= wSum;

  // XOR with a constant so erosion RNG is independent from the noise RNG.
  const rng = mulberry32(params.seed ^ 0x52a3f291);
  // Keep droplets away from edges so the brush never reads out-of-bounds.
  const border = erosionRadius + 1;
  const spawnRange = mapSize - border * 2 - 1;

  for (let drop = 0; drop < dropletCount; drop++) {
    let posX = border + rng() * spawnRange;
    let posY = border + rng() * spawnRange;
    let dirX = 0;
    let dirY = 0;
    let speed = 1;
    let water = 1;
    let sediment = 0;

    for (let step = 0; step < maxLifetime; step++) {
      const nodeX = Math.floor(posX);
      const nodeY = Math.floor(posY);
      if (nodeX < 0 || nodeX >= mapSize - 1 || nodeY < 0 || nodeY >= mapSize - 1) break;

      const ox = posX - nodeX;
      const oy = posY - nodeY;

      // Bilinear height sample and gradient at current position.
      const hNW = map[nodeY * mapSize + nodeX];
      const hNE = map[nodeY * mapSize + nodeX + 1];
      const hSW = map[(nodeY + 1) * mapSize + nodeX];
      const hSE = map[(nodeY + 1) * mapSize + nodeX + 1];

      const gradX = (hNE - hNW) * (1 - oy) + (hSE - hSW) * oy;
      const gradY = (hSW - hNW) * (1 - ox) + (hSE - hNE) * ox;
      const height =
        hNW * (1 - ox) * (1 - oy) +
        hNE * ox * (1 - oy) +
        hSW * (1 - ox) * oy +
        hSE * ox * oy;

      dirX = dirX * inertia - gradX * (1 - inertia);
      dirY = dirY * inertia - gradY * (1 - inertia);
      const len = Math.sqrt(dirX * dirX + dirY * dirY);
      if (len > 0) {
        dirX /= len;
        dirY /= len;
      }

      posX += dirX;
      posY += dirY;
      if (posX < 0 || posX >= mapSize - 1 || posY < 0 || posY >= mapSize - 1) break;

      // Bilinear height at new position.
      const nx = Math.floor(posX);
      const ny = Math.floor(posY);
      const nox = posX - nx;
      const noy = posY - ny;
      const newHeight =
        map[ny * mapSize + nx] * (1 - nox) * (1 - noy) +
        map[ny * mapSize + nx + 1] * nox * (1 - noy) +
        map[(ny + 1) * mapSize + nx] * (1 - nox) * noy +
        map[(ny + 1) * mapSize + nx + 1] * nox * noy;

      const deltaHeight = newHeight - height;
      const capacity = Math.max(-deltaHeight, minSlope) * speed * water * sedimentCapacityFactor;

      if (sediment > capacity || deltaHeight > 0) {
        // Deposit at current position bilinearly.
        const amount = deltaHeight > 0
          ? Math.min(sediment, deltaHeight)
          : (sediment - capacity) * depositSpeed;
        sediment -= amount;
        map[nodeY * mapSize + nodeX] += amount * (1 - ox) * (1 - oy);
        map[nodeY * mapSize + nodeX + 1] += amount * ox * (1 - oy);
        map[(nodeY + 1) * mapSize + nodeX] += amount * (1 - ox) * oy;
        map[(nodeY + 1) * mapSize + nodeX + 1] += amount * ox * oy;
      } else {
        // Erode from surrounding cells weighted by the brush.
        const amount = Math.min((capacity - sediment) * erodeSpeed, -deltaHeight);
        sediment += amount;
        for (let b = 0; b < brushDX.length; b++) {
          const cx = nodeX + brushDX[b];
          const cy = nodeY + brushDY[b];
          if (cx >= 0 && cx < mapSize && cy >= 0 && cy < mapSize) {
            const idx = cy * mapSize + cx;
            map[idx] = Math.max(0, map[idx] - amount * brushW[b]);
          }
        }
      }

      speed = Math.sqrt(Math.max(0, speed * speed + deltaHeight * gravity));
      water *= 1 - evaporateSpeed;
    }
  }
}
