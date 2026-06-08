import { describe, it, expect } from 'vitest'
import { createNoiseFn, fbm, fbmNormalized, type NoiseParams } from './noise'

const BASE: NoiseParams = {
  seed: 42,
  scale: 3,
  octaves: 6,
  persistence: 0.5,
  lacunarity: 2,
}

describe('createNoiseFn', () => {
  it('returns a function', () => {
    expect(typeof createNoiseFn(0)).toBe('function')
  })

  it('is deterministic for the same seed', () => {
    const a = createNoiseFn(42)
    const b = createNoiseFn(42)
    expect(a(0.5, 0.5)).toBe(b(0.5, 0.5))
  })

  it('differs across seeds', () => {
    const a = createNoiseFn(42)
    const b = createNoiseFn(99)
    expect(a(0.5, 0.5)).not.toBe(b(0.5, 0.5))
  })

  it('returns values in [-1, 1]', () => {
    const noise = createNoiseFn(1)
    for (let i = 0; i < 200; i++) {
      const v = noise(i * 0.1, i * 0.17)
      expect(v).toBeGreaterThanOrEqual(-1)
      expect(v).toBeLessThanOrEqual(1)
    }
  })
})

describe('fbm', () => {
  it('is deterministic', () => {
    const noise = createNoiseFn(BASE.seed)
    expect(fbm(1, 2, BASE, noise)).toBe(fbm(1, 2, BASE, noise))
  })

  it('more octaves increase detail (different value than 1 octave)', () => {
    const noise = createNoiseFn(BASE.seed)
    const v1 = fbm(0.3, 0.7, { ...BASE, octaves: 1 }, noise)
    const v6 = fbm(0.3, 0.7, BASE, noise)
    expect(v1).not.toBe(v6)
  })
})

describe('fbmNormalized', () => {
  it('returns values in [0, 1]', () => {
    const noise = createNoiseFn(BASE.seed)
    for (let i = 0; i < 500; i++) {
      const v = fbmNormalized(i * 0.13, i * 0.07, BASE, noise)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThanOrEqual(1)
    }
  })

  it('is deterministic', () => {
    const noise = createNoiseFn(BASE.seed)
    expect(fbmNormalized(0.5, 0.5, BASE, noise)).toBe(fbmNormalized(0.5, 0.5, BASE, noise))
  })

  it('persistence=1 does not divide by zero', () => {
    const noise = createNoiseFn(1)
    const params = { ...BASE, persistence: 1 }
    const v = fbmNormalized(0.5, 0.5, params, noise)
    expect(Number.isFinite(v)).toBe(true)
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThanOrEqual(1)
  })

  it('output shifts when seed changes', () => {
    const n42 = createNoiseFn(42)
    const n99 = createNoiseFn(99)
    expect(fbmNormalized(0.5, 0.5, BASE, n42)).not.toBe(
      fbmNormalized(0.5, 0.5, BASE, n99),
    )
  })
})
