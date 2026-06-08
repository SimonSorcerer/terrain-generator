export interface BiomeBand {
  threshold: number;
  color: [number, number, number]; // r, g, b in [0, 1]
}

export type BiomeConfig = BiomeBand[];

export const DEFAULT_BIOMES: BiomeConfig = [
  { threshold: 0.00, color: [0.05, 0.13, 0.33] }, // deep water
  { threshold: 0.25, color: [0.13, 0.32, 0.58] }, // shallow water
  { threshold: 0.35, color: [0.74, 0.68, 0.49] }, // sand
  { threshold: 0.42, color: [0.24, 0.48, 0.18] }, // grass
  { threshold: 0.62, color: [0.42, 0.37, 0.32] }, // rock
  { threshold: 0.80, color: [0.92, 0.93, 0.96] }, // snow
];

// Returns an interpolated RGB color for the given height value.
// Linearly blends between adjacent bands so transitions are smooth.
export function getColor(
  height: number,
  biomes: BiomeConfig,
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, height));

  // Last band has no upper neighbour — return it as a solid color.
  if (clamped >= biomes[biomes.length - 1].threshold) {
    return [...biomes[biomes.length - 1].color];
  }

  for (let i = biomes.length - 2; i >= 0; i--) {
    if (clamped >= biomes[i].threshold) {
      const next = biomes[i + 1];
      const bandWidth = next.threshold - biomes[i].threshold;
      const t = bandWidth > 0 ? (clamped - biomes[i].threshold) / bandWidth : 0;
      const a = biomes[i].color;
      const b = next.color;
      return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ];
    }
  }

  return [...biomes[0].color];
}
