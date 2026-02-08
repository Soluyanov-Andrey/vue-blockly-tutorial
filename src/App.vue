<template>
  <div class="app-layout">
    <!-- Blockly слева -->
    <div id="blocklyArea">
      <div id="blocklyDiv"></div>
    </div>

    <!-- Пустая правая панель (для теста) -->
    <div class="side-panel">
       <h3>JSON с координатами блоков</h3>
       <pre class="json-pre">{{ workspaceJson }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted, onUnmounted } from 'vue'
import * as Blockly from 'blockly/core'
import toolboxConfig from './toolbox.json'

let workspace: Blockly.WorkspaceSvg | null = null
const workspaceJson = ref<string>('')

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
  // ← вставляем сюда (сразу после inject)
  workspace?.addChangeListener(() => {
    updateWorkspaceJson()
  })
  setTimeout(updateWorkspaceJson, 300)  // первое обновление
  // Первый resize сразу после inject
  setTimeout(resizeBlockly, 100)
  window.addEventListener('resize', resizeBlockly)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeBlockly)
  if (workspace) workspace.dispose()
})


// Описываем новые блоки
const customBlocks = [
  {
    "type": "move_robot",
    "message0": "Двигаться вперед со скоростью %1",
    "args0": [
      {
        "type": "field_number",
        "name": "SPEED",
        "value": 100,
        "min": 0,
        "max": 255
      }
    ],
    "previousStatement": null, // Позволяет присоединять сверху
    "nextStatement": null,     // Позволяет присоединять снизу
    "colour": 230,
    "tooltip": "Запускает моторы",
    "helpUrl": ""
  },
  {
    "type": "stop_robot",
    "message0": "Остановить робота",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 0,
    "tooltip": "Выключает все моторы",
    "helpUrl": ""
  }
];

// Регистрируем их в Blockly
Blockly.common.defineBlocksWithJsonArray(customBlocks);

function resizeBlockly() {
  if (!workspace) return

  const blocklyArea = document.getElementById('blocklyArea')
  const blocklyDiv = document.getElementById('blocklyDiv')

  if (!blocklyArea || !blocklyDiv) return

  // Вычисляем размеры контейнера
  const width = blocklyArea.offsetWidth
  const height = blocklyArea.offsetHeight

  // Устанавливаем явно (это надёжнее при flex)
  blocklyDiv.style.left = '0px'
  blocklyDiv.style.top = '0px'
  blocklyDiv.style.width = width + 'px'
  blocklyDiv.style.height = height + 'px'

  // Обязательно вызываем resize Blockly
  Blockly.svgResize(workspace)
}
function updateWorkspaceJson() {
  if (!workspace) {
    workspaceJson.value = '// Workspace ещё не готов'
    return
  }

  try {
    const state = Blockly.serialization.workspaces.save(workspace)
    workspaceJson.value = JSON.stringify(state, null, 2)
  } catch (error) {
    console.error('Ошибка сериализации JSON:', error)
    workspaceJson.value = '// Ошибка: ' + String(error)
  }
}
</script>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100vh;
  /* Убираем overflow: hidden — это часто ломает absolute при resize */
  /* overflow: hidden; */  
  /* Если скроллбар мешает — оставь, но протестируй */
}

.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  min-width: 800px;          /* минимальная ширина всего приложения — предотвращает "исчезновение" при очень большом расширении */
}

#blocklyArea {
  flex: 1;
  position: relative;
  min-width: 300px;          /* не даёт Blockly сжиматься в ноль */
}

#blocklyDiv {
  position: absolute;
  /* inset: 0; — убираем, возвращаем явные размеры */
  /* left, top, width, height будут устанавливаться в JS */
}

.side-panel {
  width: 380px;
  background: #f8f9fa;
  border-left: 1px solid #dee2e6;
  padding: 16px;
  box-sizing: border-box;
  overflow-y: auto;
}

.json-pre {
  margin: 0;
  padding: 12px;
  background: #1e1e1e;
  color: #d4d4d4;
  border-radius: 6px;
  font-family: Consolas, monospace;
  font-size: 13px;
  white-space: pre-wrap;
  overflow: auto;
  flex: 1;
}
</style>

