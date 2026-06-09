<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { terrainParams, heightmap, waterParams } from '../stores/terrain';
  import { sceneParams } from '../stores/scene';
  import { initScene } from '../lib/renderer/scene';
  import { createTerrainMesh, updateTerrainMesh } from '../lib/renderer/terrain-mesh';
  import { createWaterMesh, updateWaterLevel, updateWaterAppearance } from '../lib/renderer/water-mesh';
  import { DEFAULT_BIOMES } from '../lib/terrain/biomes';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = initScene(canvas);

    const terrain = createTerrainMesh(get(terrainParams).resolution);
    const water = createWaterMesh();
    ctx.scene.add(terrain.mesh);
    ctx.scene.add(water.mesh);

    // Terrain + water level: driven by terrainParams (heightmap recomputes on any change).
    const unsubTerrain = heightmap.subscribe((hm) => {
      const p = get(terrainParams);
      updateTerrainMesh(terrain, hm, p.heightScale, DEFAULT_BIOMES);
      updateWaterLevel(water, p.seaLevel, p.heightScale);
    });

    // Water appearance: separate subscription so tweaking color/opacity never
    // triggers a heightmap regeneration.
    const unsubWater = waterParams.subscribe((wp) => {
      updateWaterAppearance(water, wp);
    });

    const unsubScene = sceneParams.subscribe((sp) => {
      ctx.setFog(sp.fogEnabled, sp.fogDensity, sp.fogColor);
      ctx.setSunAngle(sp.sunAzimuth, sp.sunElevation, sp.sunIntensity);
    });

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      ctx.resize(width, height);
    });
    ro.observe(canvas);
    ctx.resize(canvas.clientWidth, canvas.clientHeight);

    ctx.startLoop();

    return () => {
      unsubTerrain();
      unsubWater();
      unsubScene();
      ro.disconnect();
      ctx.dispose();
    };
  });
</script>

<canvas bind:this={canvas}></canvas>

<style>
  canvas {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
