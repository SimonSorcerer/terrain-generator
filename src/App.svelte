<script lang="ts">
</script>

<div class="layout">
  <div class="canvas-area">
    <!-- TerrainCanvas goes here (Task 9) -->
  </div>
  <aside class="panel">
    <!-- ControlPanel goes here (Task 10) -->
  </aside>
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

  .panel {
    width: 280px;
    flex-shrink: 0;
    background: #18181c;
    border-left: 1px solid #2a2a30;
    overflow-y: auto;
  }
</style>
