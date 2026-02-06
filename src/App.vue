<template>
  <div id="blocklyArea">
    <div id="blocklyDiv"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import * as Blockly from 'blockly/core'
import toolboxConfig from './toolbox.json'

let workspace: Blockly.WorkspaceSvg | null = null

onMounted(() => {
  workspace = Blockly.inject('blocklyDiv', {
    toolbox: toolboxConfig,
    zoom: {
      controls: true,
      wheel: true,
      startScale: 1.0,
      maxScale: 4,
      minScale: 0.3
    },
    move: {
      scrollbars: true,
      drag: true,
      wheel: true
    },
    grid: {
      spacing: 25,
      length: 3,
      colour: '#ccc',
      snap: true
    },
    trashcan: true,
    renderer: 'zelos'          // современный, красивый рендерер
  })

  // Первый resize сразу после inject
  setTimeout(resizeBlockly, 100)
  window.addEventListener('resize', resizeBlockly)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeBlockly)
  if (workspace) workspace.dispose()
})

function resizeBlockly() {
  if (!workspace) return

  const blocklyArea = document.getElementById('blocklyArea')
  const blocklyDiv = document.getElementById('blocklyDiv')

  if (!blocklyArea || !blocklyDiv) return

  // Вычисляем абсолютную позицию области
  let element = blocklyArea
  let x = 0
  let y = 0
  do {
    x += element.offsetLeft
    y += element.offsetTop
    element = element.offsetParent as HTMLElement
  } while (element)

  // Устанавливаем позицию и размер div'а
  blocklyDiv.style.left = x + 'px'
  blocklyDiv.style.top = y + 'px'
  blocklyDiv.style.width = blocklyArea.offsetWidth + 'px'
  blocklyDiv.style.height = blocklyArea.offsetHeight + 'px'

  // Самое важное — заставляем Blockly перерисоваться
  Blockly.svgResize(workspace)
}
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
