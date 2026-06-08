<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { terrainParams, heightmap } from '../stores/terrain';
  import { initScene } from '../lib/renderer/scene';
  import { createTerrainMesh, updateTerrainMesh } from '../lib/renderer/terrain-mesh';
  import { createWaterMesh, updateWaterLevel } from '../lib/renderer/water-mesh';
  import { DEFAULT_BIOMES } from '../lib/terrain/biomes';

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = initScene(canvas);

    const terrain = createTerrainMesh(get(terrainParams).resolution);
    const water = createWaterMesh();
    ctx.scene.add(terrain.mesh);
    ctx.scene.add(water.mesh);

    // Runs on every param change — heightmap is derived so it recomputes automatically.
    const unsub = heightmap.subscribe((hm) => {
      const p = get(terrainParams);
      updateTerrainMesh(terrain, hm, p.heightScale, DEFAULT_BIOMES);
      updateWaterLevel(water, p.seaLevel, p.heightScale);
    });

    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      ctx.resize(width, height);
    });
    ro.observe(canvas);
    ctx.resize(canvas.clientWidth, canvas.clientHeight);

    ctx.startLoop();

    return () => {
      unsub();
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
