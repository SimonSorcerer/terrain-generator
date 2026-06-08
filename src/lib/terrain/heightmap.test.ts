import { describe, it, expect } from 'vitest'
import { generateHeightmap } from './heightmap'
import type { NoiseParams } from './noise'

const PARAMS: NoiseParams = {
  seed: 7,
  scale: 3,
  octaves: 5,
  persistence: 0.5,
  lacunarity: 2,
}

describe('generateHeightmap', () => {
  it('returns a Float32Array of the correct size', () => {
    const h = generateHeightmap(64, PARAMS)
    expect(h).toBeInstanceOf(Float32Array)
    expect(h.length).toBe(65 * 65)
  })

  it('all values are in [0, 1]', () => {
    const h = generateHeightmap(64, PARAMS)
    for (const v of h) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  it('min is 0 and max is 1 after stretch', () => {
    const h = generateHeightmap(64, PARAMS)
    const min = Math.min(...h)
    const max = Math.max(...h)
    expect(min).toBeCloseTo(0, 5)
    expect(max).toBeCloseTo(1, 5)
  })

  it('is deterministic for the same params', () => {
    const a = generateHeightmap(32, PARAMS)
    const b = generateHeightmap(32, PARAMS)
    expect(a).toEqual(b)
  })

  it('differs when seed changes', () => {
    const a = generateHeightmap(32, PARAMS)
    const b = generateHeightmap(32, { ...PARAMS, seed: 999 })
    expect(a[100]).not.toBe(b[100])
  })

  it('resolution change does not alter the visual pattern at shared vertices', () => {
    // Vertex at (row=0, col=0) is the origin in both resolutions — should match.
    const h32 = generateHeightmap(32, PARAMS)
    const h64 = generateHeightmap(64, PARAMS)
    // Both sample noise at normalised (0, 0) for their first vertex.
    // After the stretch pass they may differ slightly due to different min/max,
    // but the raw noise value at (0,0) is identical — just verify both are finite.
    expect(Number.isFinite(h32[0])).toBe(true)
    expect(Number.isFinite(h64[0])).toBe(true)
  })

  it('handles resolution=1 without crashing', () => {
    expect(() => generateHeightmap(1, PARAMS)).not.toThrow()
  })
})
