<script lang="ts">
  import { terrainParams, waterParams } from '../stores/terrain';

  function set<K extends keyof typeof $terrainParams>(key: K, value: typeof $terrainParams[K]) {
    terrainParams.update((p) => ({ ...p, [key]: value }));
  }

  function setWater<K extends keyof typeof $waterParams>(key: K, value: typeof $waterParams[K]) {
    waterParams.update((p) => ({ ...p, [key]: value }));
  }
</script>

<div class="panel">
  <h2>Terrain Generator</h2>

  <section>
    <h3>Noise</h3>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Initialises the random number generator. Every integer produces a completely different terrain — same seed always gives the same result.">Seed</span>
      </div>
      <div class="row">
        <input
          type="number"
          value={$terrainParams.seed}
          min="0"
          max="999999"
          oninput={(e) => set('seed', parseInt(e.currentTarget.value) || 0)}
        />
      </div>
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Zooms the noise pattern. Higher values spread features out, creating broad mountains and wide valleys. Lower values compress them into tighter, busier terrain.">Scale</span>
        <span class="value">{$terrainParams.scale.toFixed(1)}</span>
      </div>
      <input
        type="range" min="0.5" max="10" step="0.1"
        value={$terrainParams.scale}
        oninput={(e) => set('scale', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Number of noise layers stacked together. Each additional octave adds a finer layer of detail on top of the coarser shape beneath it.">Octaves</span>
        <span class="value">{$terrainParams.octaves}</span>
      </div>
      <input
        type="range" min="1" max="8" step="1"
        value={$terrainParams.octaves}
        oninput={(e) => set('octaves', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="How much each successive octave contributes relative to the one before. Lower values (≈ 0.5) fade out finer detail, producing smoother terrain. Higher values keep detail loud, creating rougher, more jagged surfaces.">Persistence</span>
        <span class="value">{$terrainParams.persistence.toFixed(2)}</span>
      </div>
      <input
        type="range" min="0.1" max="1" step="0.01"
        value={$terrainParams.persistence}
        oninput={(e) => set('persistence', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="How much the frequency multiplies per octave. At 2.0 each layer is twice as fine as the previous. Higher values jump to much finer scales each layer, increasing surface complexity.">Lacunarity</span>
        <span class="value">{$terrainParams.lacunarity.toFixed(2)}</span>
      </div>
      <input
        type="range" min="1" max="4" step="0.05"
        value={$terrainParams.lacunarity}
        oninput={(e) => set('lacunarity', +e.currentTarget.value)}
      />
    </label>
  </section>

  <section>
    <h3>Terrain</h3>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Vertical exaggeration in world units. Stretches the normalised [0–1] heightmap values into actual 3D height. Does not change the shape of the terrain, only how tall it appears.">Height scale</span>
        <span class="value">{$terrainParams.heightScale}</span>
      </div>
      <input
        type="range" min="1" max="100" step="1"
        value={$terrainParams.heightScale}
        oninput={(e) => set('heightScale', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Height at which the water plane is placed, as a fraction of the full terrain range. Raising it floods more of the landscape; lowering it exposes more land.">Sea level</span>
        <span class="value">{$terrainParams.seaLevel.toFixed(2)}</span>
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={$terrainParams.seaLevel}
        oninput={(e) => set('seaLevel', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Grid divisions along each axis. Higher values produce smoother, more detailed meshes but increase generation time and GPU vertex count.">Resolution</span>
      </div>
      <select
        value={$terrainParams.resolution}
        onchange={(e) => set('resolution', +e.currentTarget.value)}
      >
        <option value={64}>64 × 64</option>
        <option value={128}>128 × 128</option>
        <option value={256}>256 × 256</option>
        <option value={512}>512 × 512</option>
      </select>
    </label>
  </section>

  <section>
    <h3>Water</h3>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Base colour of the water surface. Combined with opacity and roughness to determine how the water looks under lighting.">Color</span>
      </div>
      <input
        type="color"
        value={$waterParams.waterColor}
        oninput={(e) => setWater('waterColor', e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="How transparent the water is. Lower values let you see terrain beneath the surface; higher values make the water more opaque.">Opacity</span>
        <span class="value">{$waterParams.waterOpacity.toFixed(2)}</span>
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={$waterParams.waterOpacity}
        oninput={(e) => setWater('waterOpacity', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Surface roughness of the water. Low values produce a mirror-like sheen; high values scatter light for a matte, choppy appearance.">Roughness</span>
        <span class="value">{$waterParams.waterRoughness.toFixed(2)}</span>
      </div>
      <input
        type="range" min="0" max="1" step="0.01"
        value={$waterParams.waterRoughness}
        oninput={(e) => setWater('waterRoughness', +e.currentTarget.value)}
      />
    </label>
  </section>
</div>

<style>
  .panel {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  h2 {
    margin: 0 0 16px;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #a0a0b0;
  }

  h3 {
    margin: 0 0 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #606070;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 16px;
    border-bottom: 1px solid #2a2a30;
    margin-bottom: 8px;
  }

  section:last-child {
    border-bottom: none;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: #c0c0d0;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .value {
    margin-left: auto;
    color: #80c0ff;
    font-variant-numeric: tabular-nums;
  }

  /* Tooltip anchor */
  .param-name {
    position: relative;
    cursor: help;
    border-bottom: 1px dotted #505060;
    width: fit-content;
  }

  /* Tooltip bubble */
  .param-name::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 6px);
    left: 0;
    width: 220px;
    background: #1a1a24;
    border: 1px solid #3a3a50;
    border-radius: 4px;
    color: #a0a8b8;
    font-size: 10px;
    line-height: 1.55;
    padding: 6px 9px;
    z-index: 100;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.15s ease;
    white-space: normal;
  }

  .param-name:hover::after {
    opacity: 1;
  }

  input[type='range'] {
    width: 100%;
    accent-color: #4a90d9;
    cursor: pointer;
  }

  input[type='color'] {
    width: 100%;
    height: 28px;
    padding: 2px 3px;
    background: #222228;
    border: 1px solid #3a3a44;
    border-radius: 4px;
    cursor: pointer;
  }

  input[type='number'] {
    width: 100%;
    background: #222228;
    border: 1px solid #3a3a44;
    border-radius: 4px;
    color: #e2e2e5;
    padding: 4px 8px;
    font-size: 12px;
  }

  select {
    width: 100%;
    background: #222228;
    border: 1px solid #3a3a44;
    border-radius: 4px;
    color: #e2e2e5;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
  }
</style>
