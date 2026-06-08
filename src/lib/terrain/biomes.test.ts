import { describe, it, expect } from 'vitest'
import { getColor, DEFAULT_BIOMES, type BiomeConfig } from './biomes'

describe('getColor with DEFAULT_BIOMES', () => {
  it('returns deep-water blue at height 0', () => {
    const [r, g, b] = getColor(0, DEFAULT_BIOMES)
    expect(b).toBeGreaterThan(r)
    expect(b).toBeGreaterThan(g)
  })

  it('returns snow (near-white) at height 1', () => {
    const [r, g, b] = getColor(1, DEFAULT_BIOMES)
    expect(r).toBeGreaterThan(0.8)
    expect(g).toBeGreaterThan(0.8)
    expect(b).toBeGreaterThan(0.8)
  })

  it('all outputs are in [0, 1] across the full range', () => {
    for (let i = 0; i <= 100; i++) {
      const h = i / 100
      const [r, g, b] = getColor(h, DEFAULT_BIOMES)
      expect(r).toBeGreaterThanOrEqual(0)
      expect(r).toBeLessThanOrEqual(1)
      expect(g).toBeGreaterThanOrEqual(0)
      expect(g).toBeLessThanOrEqual(1)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThanOrEqual(1)
    }
  })

  it('clamps heights below 0', () => {
    expect(getColor(-1, DEFAULT_BIOMES)).toEqual(getColor(0, DEFAULT_BIOMES))
  })

  it('clamps heights above 1', () => {
    expect(getColor(2, DEFAULT_BIOMES)).toEqual(getColor(1, DEFAULT_BIOMES))
  })

  it('returns last band color for height at and above last threshold', () => {
    const last = DEFAULT_BIOMES[DEFAULT_BIOMES.length - 1]
    expect(getColor(last.threshold, DEFAULT_BIOMES)).toEqual([...last.color])
    expect(getColor(1, DEFAULT_BIOMES)).toEqual([...last.color])
  })

  it('interpolates smoothly between bands', () => {
    const grass = DEFAULT_BIOMES.find(b => b.color[1] > b.color[0] && b.color[1] > b.color[2])!
    const idx = DEFAULT_BIOMES.indexOf(grass)
    const next = DEFAULT_BIOMES[idx + 1]
    const mid = (grass.threshold + next.threshold) / 2

    const [, gMid] = getColor(mid, DEFAULT_BIOMES)
    const [, gStart] = getColor(grass.threshold, DEFAULT_BIOMES)
    const [, gEnd] = getColor(next.threshold, DEFAULT_BIOMES)

    // Midpoint green channel should be between the two band endpoints
    const lo = Math.min(gStart, gEnd)
    const hi = Math.max(gStart, gEnd)
    expect(gMid).toBeGreaterThanOrEqual(lo - 1e-6)
    expect(gMid).toBeLessThanOrEqual(hi + 1e-6)
  })
})

describe('getColor with custom biomes', () => {
  const custom: BiomeConfig = [
    { threshold: 0.0, color: [1, 0, 0] },
    { threshold: 0.5, color: [0, 1, 0] },
    { threshold: 1.0, color: [0, 0, 1] },
  ]

  it('returns red at threshold 0', () => {
    expect(getColor(0, custom)).toEqual([1, 0, 0])
  })

  it('returns blue at threshold 1', () => {
    expect(getColor(1, custom)).toEqual([0, 0, 1])
  })

  it('returns pure green exactly at threshold 0.5', () => {
    const [r, g, b] = getColor(0.5, custom)
    expect(r).toBeCloseTo(0, 5)
    expect(g).toBeCloseTo(1, 5)
    expect(b).toBeCloseTo(0, 5)
  })

  it('returns midpoint colour at h=0.25', () => {
    const [r, g, b] = getColor(0.25, custom)
    expect(r).toBeCloseTo(0.5, 5)
    expect(g).toBeCloseTo(0.5, 5)
    expect(b).toBeCloseTo(0, 5)
  })
})
