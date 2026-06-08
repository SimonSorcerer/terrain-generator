# Terrain Generator

A browser-based procedural terrain generator with real-time parameter tuning and 3D visualization.

## Stack

- **Svelte 5 + Vite** — UI framework and build tool
- **TypeScript** — strict mode enabled
- **Three.js** — WebGL 3D rendering
- **simplex-noise** — noise generation

## Project structure

```
src/
  lib/
    terrain/
      noise.ts          # Simplex noise wrapper + fBm (fractal Brownian motion)
      heightmap.ts      # Generates a Float32Array heightmap from noise params
      biomes.ts         # Maps height + moisture to RGB color
    renderer/
      scene.ts          # Three.js scene, camera, renderer lifecycle
      terrain-mesh.ts   # PlaneGeometry with per-vertex colors from heightmap
      water-mesh.ts     # Transparent water plane rendered at sea level
  stores/
    terrain.ts          # Svelte stores holding live terrain params
  components/
    TerrainCanvas.svelte  # Mounts the Three.js renderer; drives the animation loop
    ControlPanel.svelte   # Sliders and inputs wired to the terrain stores
  App.svelte
  main.ts
```

## Architecture

**Separation of concerns**: terrain generation (`lib/terrain/`) has zero Three.js imports. It is pure math → data. The renderer (`lib/renderer/`) consumes that data. This makes noise and heightmap logic easy to test and swap independently.

**Reactivity flow**: Svelte stores (`stores/terrain.ts`) hold all params (seed, scale, octaves, persistence, lacunarity, sea level, biome config). `ControlPanel.svelte` writes to stores. `TerrainCanvas.svelte` subscribes and triggers a mesh rebuild when any param changes — without tearing down the scene.

**Mesh update strategy**: on param change, update the position and color `BufferAttribute` data in place and set `needsUpdate = true`. Only recreate the geometry object if the grid resolution changes.

**Camera**: use `OrbitControls` from `three/examples/jsm/controls/OrbitControls.js`.

## Terrain generation

- Heightmap is a flat `Float32Array` of size `(resolution + 1)² ` with values in `[0, 1]`.
- `noise.ts` exposes `fbm(x, y, params)` — fractal Brownian motion layering `n` octaves of simplex noise with configurable persistence and lacunarity.
- `heightmap.ts` calls `fbm` for each grid vertex, normalises the output, and returns the array.
- `biomes.ts` takes a height value (and optionally a moisture value derived from a second noise layer) and returns a `[r, g, b]` triple. Default bands: deep water → shallow water → sand → grass → rock → snow.

## Rendering

- `scene.ts` creates the `WebGLRenderer`, `PerspectiveCamera`, and `Scene`. It exports `init(canvas)` and `dispose()`.
- `terrain-mesh.ts` creates a `PlaneGeometry`, rotates it flat (`-Math.PI / 2` on X), displaces vertices on Y from the heightmap, and sets per-vertex colours.
- `water-mesh.ts` creates a semi-transparent `MeshStandardMaterial` plane positioned at the sea-level height.
- `DirectionalLight` + `AmbientLight` are set up in `scene.ts`.

## Testing

Critical algorithmic functions and critical logic must have unit tests. This covers all of `lib/terrain/` (noise, heightmap, biomes) and any non-trivial pure functions added in future.

Use **Vitest** (already compatible with the Vite setup — add it as a dev dependency when writing the first test). Test files live alongside source files as `*.test.ts`.

What to test:
- Output ranges and invariants (e.g. heightmap values always in `[0, 1]`)
- Seed determinism and independence
- Biome color interpolation correctness and boundary conditions
- Any math-heavy helper with non-obvious edge cases

What not to test:
- Three.js renderer code (requires a WebGL context — not worth mocking)
- Svelte components (covered by manual UI testing)

## Dev commands

```
npm run dev    # Vite dev server
npm run build  # Production build
npm run check  # Svelte type-check
npm run test   # Unit tests (once Vitest is set up)
```

## Conventions

- No comments explaining what code does — name things well instead.
- Add a comment only when the WHY is non-obvious (math derivations, Three.js quirks, WebGL constraints).
- Keep terrain math pure and side-effect-free.
- Prefer updating `BufferAttribute` data over recreating geometry.
- Do not add features beyond what is described here without user confirmation.
