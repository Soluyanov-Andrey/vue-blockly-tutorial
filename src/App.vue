<!-- src/App.vue -->
<template>
  <div id="blocklyArea">
    <div id="blocklyDiv"></div>
  </div>
</template>

<script setup lang="ts">
import { useBlockly } from './composables/useBlockly'

// Просто вызываем composable — вся магия внутри него
useBlockly()
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

#blocklyArea {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100vh;
}

#blocklyDiv {
  position: absolute;
}
</style>
