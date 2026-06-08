<script lang="ts">
  import TerrainCanvas from './components/TerrainCanvas.svelte';
  import ControlPanel from './components/ControlPanel.svelte';

  let panelOpen = $state(true);
</script>

<div class="layout">
  <div class="canvas-area">
    <TerrainCanvas />

    <button
      class="toggle"
      class:closed={!panelOpen}
      onclick={() => (panelOpen = !panelOpen)}
      title={panelOpen ? 'Hide panel' : 'Show panel'}
    >
      {panelOpen ? '›' : '‹'}
    </button>
  </div>

  {#if panelOpen}
    <aside class="panel">
      <ControlPanel />
    </aside>
  {/if}
</div>

<style>
  .layout {
    display: flex;
    width: 100%;
    height: 100%;
  }

  .canvas-area {
    flex: 1;
    position: relative;
    overflow: hidden;
  }

  .toggle {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    background: #18181c;
    border: 1px solid #2a2a30;
    border-right: none;
    color: #a0a0b0;
    width: 20px;
    height: 48px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 4px 0 0 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: color 0.15s;
  }

  .toggle:hover {
    color: #e2e2e5;
  }

  .panel {
    width: 280px;
    flex-shrink: 0;
    background: #18181c;
    border-left: 1px solid #2a2a30;
    overflow-y: auto;
  }
</style>
