<script lang="ts">
  import { terrainParams } from '../stores/terrain';

  function set<K extends keyof typeof $terrainParams>(key: K, value: typeof $terrainParams[K]) {
    terrainParams.update((p) => ({ ...p, [key]: value }));
  }
</script>

<div class="panel">
  <h2>Terrain Generator</h2>

  <section>
    <h3>Noise</h3>

    <label>
      Seed
      <div class="row">
        <input
          type="number"
          value={$terrainParams.seed}
          min="0"
          max="999999"
          oninput={(e) => set('seed', parseInt(e.currentTarget.value) || 0)}
        />
      </div>
      <span class="hint">Initialises the random number generator. Every integer produces a completely different terrain — same seed always gives the same result.</span>
    </label>

    <label>
      Scale <span class="value">{$terrainParams.scale.toFixed(1)}</span>
      <input
        type="range" min="0.5" max="10" step="0.1"
        value={$terrainParams.scale}
        oninput={(e) => set('scale', +e.currentTarget.value)}
      />
      <span class="hint">Zooms the noise pattern. Higher values spread features out, creating broad mountains and wide valleys. Lower values compress them into tighter, busier terrain.</span>
    </label>

    <label>
      Octaves <span class="value">{$terrainParams.octaves}</span>
      <input
        type="range" min="1" max="8" step="1"
        value={$terrainParams.octaves}
        oninput={(e) => set('octaves', +e.currentTarget.value)}
      />
      <span class="hint">Number of noise layers stacked together. Each additional octave adds a finer layer of detail on top of the coarser shape beneath it.</span>
    </label>

    <label>
      Persistence <span class="value">{$terrainParams.persistence.toFixed(2)}</span>
      <input
        type="range" min="0.1" max="1" step="0.01"
        value={$terrainParams.persistence}
        oninput={(e) => set('persistence', +e.currentTarget.value)}
      />
      <span class="hint">How much each successive octave contributes relative to the one before. Lower values (≈ 0.5) fade out finer detail, producing smoother terrain. Higher values keep detail loud, creating rougher, more jagged surfaces.</span>
    </label>

    <label>
      Lacunarity <span class="value">{$terrainParams.lacunarity.toFixed(2)}</span>
      <input
        type="range" min="1" max="4" step="0.05"
        value={$terrainParams.lacunarity}
        oninput={(e) => set('lacunarity', +e.currentTarget.value)}
      />
      <span class="hint">How much the frequency multiplies per octave. At 2.0 each layer is twice as fine as the previous. Higher values make successive layers jump to much finer scales, increasing surface complexity.</span>
    </label>
  </section>

  <section>
    <h3>Terrain</h3>

    <label>
      Height scale <span class="value">{$terrainParams.heightScale}</span>
      <input
        type="range" min="1" max="100" step="1"
        value={$terrainParams.heightScale}
        oninput={(e) => set('heightScale', +e.currentTarget.value)}
      />
      <span class="hint">Vertical exaggeration in world units. Stretches the normalised [0–1] heightmap values into actual 3D height. Does not change the shape of the terrain, only how tall it appears.</span>
    </label>

    <label>
      Sea level <span class="value">{$terrainParams.seaLevel.toFixed(2)}</span>
      <input
        type="range" min="0" max="1" step="0.01"
        value={$terrainParams.seaLevel}
        oninput={(e) => set('seaLevel', +e.currentTarget.value)}
      />
      <span class="hint">Height at which the water plane is placed, as a fraction of the full terrain range. Raising it floods more of the landscape; lowering it exposes more land.</span>
    </label>

    <label>
      Resolution
      <select
        value={$terrainParams.resolution}
        onchange={(e) => set('resolution', +e.currentTarget.value)}
      >
        <option value={64}>64 × 64</option>
        <option value={128}>128 × 128</option>
        <option value={256}>256 × 256</option>
        <option value={512}>512 × 512</option>
      </select>
      <span class="hint">Grid divisions along each axis. Higher values produce smoother, more detailed meshes but increase generation time and GPU vertex count.</span>
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

  .value {
    margin-left: auto;
    color: #80c0ff;
    font-variant-numeric: tabular-nums;
  }

  label > :first-child {
    display: flex;
    align-items: center;
  }

  .hint {
    font-size: 10px;
    line-height: 1.5;
    color: #505060;
  }

  input[type='range'] {
    width: 100%;
    accent-color: #4a90d9;
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

  .row {
    width: 100%;
  }
</style>
