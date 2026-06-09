<script lang="ts">
  import { terrainParams, waterParams } from '../stores/terrain';
  import { sceneParams } from '../stores/scene';
  import { GENERATORS, GENERATOR_LABELS } from '../lib/terrain/generator';

  function setScene<K extends keyof typeof $sceneParams>(key: K, value: typeof $sceneParams[K]) {
    sceneParams.update((p) => ({ ...p, [key]: value }));
  }

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
        <span class="param-name" data-tooltip="The algorithm used to generate the heightmap. Each algorithm produces a different style of terrain.">Generator</span>
      </div>
      <select
        value={$terrainParams.generatorType}
        onchange={(e) => set('generatorType', e.currentTarget.value)}
      >
        {#each Object.keys(GENERATORS) as key (key)}
          <option value={key}>{GENERATOR_LABELS[key] ?? key}</option>
        {/each}
      </select>
    </label>

    {#if $terrainParams.generatorType === 'domain-warped'}
      <label>
        <div class="row">
          <span class="param-name" data-tooltip="How far the input coordinates are displaced before sampling. Higher values produce more twisted, flowing terrain shapes.">Warp strength</span>
          <span class="value">{$terrainParams.warpStrength.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="2" step="0.05"
          value={$terrainParams.warpStrength}
          oninput={(e) => set('warpStrength', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Frequency of the warp noise relative to the main noise. Lower values create broad, gradual deformations; higher values create fine, chaotic warping.">Warp scale</span>
          <span class="value">{$terrainParams.warpScale.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0.1" max="3" step="0.05"
          value={$terrainParams.warpScale}
          oninput={(e) => set('warpScale', +e.currentTarget.value)}
        />
      </label>
    {/if}

    {#if $terrainParams.generatorType === 'ridged'}
      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Controls how sharp the ridge peaks are. At 1 ridges are broad and rounded; higher values produce thinner, knife-edge peaks.">Sharpness</span>
          <span class="value">{$terrainParams.sharpness.toFixed(1)}</span>
        </div>
        <input
          type="range" min="1" max="4" step="0.1"
          value={$terrainParams.sharpness}
          oninput={(e) => set('sharpness', +e.currentTarget.value)}
        />
      </label>
    {/if}

    {#if $terrainParams.generatorType === 'hydraulic'}
      <p class="hint">Heavy computation — avoid moving sliders rapidly.</p>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Number of water droplets simulated. More droplets produce smoother, more detailed erosion but take longer to compute.">Droplets</span>
          <span class="value">{$terrainParams.dropletCount.toLocaleString()}</span>
        </div>
        <input
          type="range" min="1000" max="100000" step="1000"
          value={$terrainParams.dropletCount}
          oninput={(e) => set('dropletCount', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Radius (in grid cells) over which each erosion event is spread. Larger values produce smoother, more gradual erosion; smaller values dig sharper, more defined channels.">Erosion radius</span>
          <span class="value">{$terrainParams.erosionRadius}</span>
        </div>
        <input
          type="range" min="1" max="6" step="1"
          value={$terrainParams.erosionRadius}
          oninput={(e) => set('erosionRadius', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="How much a droplet retains its current direction versus turning to follow the gradient. Higher inertia produces longer, straighter channels; lower values produce more winding paths.">Inertia</span>
          <span class="value">{$terrainParams.inertia.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={$terrainParams.inertia}
          oninput={(e) => set('inertia', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Speed at which a droplet picks up sediment from the terrain when it has capacity. Higher values carve deeper channels faster.">Erosion speed</span>
          <span class="value">{$terrainParams.erodeSpeed.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={$terrainParams.erodeSpeed}
          oninput={(e) => set('erodeSpeed', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Speed at which excess sediment is deposited onto the terrain. Higher values produce more pronounced alluvial fans and sediment plains.">Deposit speed</span>
          <span class="value">{$terrainParams.depositSpeed.toFixed(2)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.01"
          value={$terrainParams.depositSpeed}
          oninput={(e) => set('depositSpeed', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Rate at which water evaporates each step. Higher values make droplets die sooner, creating shorter channels; lower values let droplets travel farther.">Evaporate speed</span>
          <span class="value">{$terrainParams.evaporateSpeed.toFixed(3)}</span>
        </div>
        <input
          type="range" min="0.001" max="0.05" step="0.001"
          value={$terrainParams.evaporateSpeed}
          oninput={(e) => set('evaporateSpeed', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Gravitational acceleration applied to droplet speed. Higher gravity makes droplets accelerate faster on slopes, eroding more on steep terrain.">Gravity</span>
          <span class="value">{$terrainParams.gravity.toFixed(1)}</span>
        </div>
        <input
          type="range" min="1" max="20" step="0.5"
          value={$terrainParams.gravity}
          oninput={(e) => set('gravity', +e.currentTarget.value)}
        />
      </label>

      <label class="row-label">
        <span class="param-name" data-tooltip="Runs a thermal erosion pass after the hydraulic simulation. Smooths the steep cliff walls left by water erosion into realistic scree slopes. Compare before/after by toggling.">Thermal erosion pass</span>
        <input
          type="checkbox"
          checked={$terrainParams.thermalEnabled}
          onchange={(e) => set('thermalEnabled', e.currentTarget.checked)}
        />
      </label>

      {#if $terrainParams.thermalEnabled}
        <label>
          <div class="row">
            <span class="param-name" data-tooltip="Number of smoothing passes. More iterations converge toward the talus angle but take longer to compute.">Thermal iterations</span>
            <span class="value">{$terrainParams.thermalIterations}</span>
          </div>
          <input
            type="range" min="1" max="50" step="1"
            value={$terrainParams.thermalIterations}
            oninput={(e) => set('thermalIterations', +e.currentTarget.value)}
          />
        </label>

        <label>
          <div class="row">
            <span class="param-name" data-tooltip="Maximum stable slope before material slides. Lower values produce smoother, more gently graded terrain; higher values allow steeper stable faces.">Talus angle</span>
            <span class="value">{$terrainParams.talusAngle.toFixed(3)}</span>
          </div>
          <input
            type="range" min="0.005" max="0.2" step="0.005"
            value={$terrainParams.talusAngle}
            oninput={(e) => set('talusAngle', +e.currentTarget.value)}
          />
        </label>
      {/if}
    {/if}

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

  <section>
    <h3>Scene</h3>

    <label class="row-label">
      <span class="param-name" data-tooltip="Adds exponential atmospheric haze that fades distant terrain to the fog color. Improves depth perception and hides the terrain edge.">Fog</span>
      <input
        type="checkbox"
        checked={$sceneParams.fogEnabled}
        onchange={(e) => setScene('fogEnabled', e.currentTarget.checked)}
      />
    </label>

    {#if $sceneParams.fogEnabled}
      <label>
        <div class="row">
          <span class="param-name" data-tooltip="How thick the fog is. Higher values make the haze denser and start closer to the camera.">Fog density</span>
          <span class="value">{$sceneParams.fogDensity.toFixed(4)}</span>
        </div>
        <input
          type="range" min="0.0005" max="0.01" step="0.0005"
          value={$sceneParams.fogDensity}
          oninput={(e) => setScene('fogDensity', +e.currentTarget.value)}
        />
      </label>

      <label>
        <div class="row">
          <span class="param-name" data-tooltip="Color of the fog and scene background. Should match the sky tone you want — dark blue for night, light grey for overcast.">Fog color</span>
        </div>
        <input
          type="color"
          value={$sceneParams.fogColor}
          oninput={(e) => setScene('fogColor', e.currentTarget.value)}
        />
      </label>
    {/if}

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Horizontal angle of the sun around the terrain. Rotating it changes which faces are lit and which are in shadow.">Sun azimuth</span>
        <span class="value">{$sceneParams.sunAzimuth}°</span>
      </div>
      <input
        type="range" min="0" max="360" step="1"
        value={$sceneParams.sunAzimuth}
        oninput={(e) => setScene('sunAzimuth', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Vertical angle of the sun above the horizon. Low values produce long shadows and dramatic side-lighting; high values light terrain more evenly from above.">Sun elevation</span>
        <span class="value">{$sceneParams.sunElevation}°</span>
      </div>
      <input
        type="range" min="5" max="90" step="1"
        value={$sceneParams.sunElevation}
        oninput={(e) => setScene('sunElevation', +e.currentTarget.value)}
      />
    </label>

    <label>
      <div class="row">
        <span class="param-name" data-tooltip="Brightness of the directional sun light. Higher values increase contrast between lit and shadowed faces.">Sun intensity</span>
        <span class="value">{$sceneParams.sunIntensity.toFixed(1)}</span>
      </div>
      <input
        type="range" min="0" max="3" step="0.1"
        value={$sceneParams.sunIntensity}
        oninput={(e) => setScene('sunIntensity', +e.currentTarget.value)}
      />
    </label>
  </section>
</div>

<style>
  .row-label {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
  }

  .hint {
    margin: 0;
    font-size: 10px;
    color: #a08040;
    font-style: italic;
  }

  input[type='checkbox'] {
    width: 14px;
    height: 14px;
    accent-color: #4a90d9;
    cursor: pointer;
    flex-shrink: 0;
  }

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
