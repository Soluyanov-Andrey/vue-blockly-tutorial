import { onMounted, onUnmounted, ref } from 'vue'
import * as Blockly from 'blockly/core'
import toolboxConfig from '@/toolbox.json'  // @ = src/ (настройте alias в vite.config.ts, если нужно)

export function useBlockly() {
  const workspace = ref<Blockly.WorkspaceSvg | null>(null)

  function resizeBlockly() {
    if (!workspace.value) return

    const blocklyArea = document.getElementById('blocklyArea')
    const blocklyDiv = document.getElementById('blocklyDiv')
    if (!blocklyArea || !blocklyDiv) return

    let element: HTMLElement | null = blocklyArea
    let x = 0
    let y = 0
    do {
      x += element.offsetLeft
      y += element.offsetTop
      element = element.offsetParent as HTMLElement
    } while (element)

    blocklyDiv.style.left = `${x}px`
    blocklyDiv.style.top = `${y}px`
    blocklyDiv.style.width = `${blocklyArea.offsetWidth}px`
    blocklyDiv.style.height = `${blocklyArea.offsetHeight}px`

    Blockly.svgResize(workspace.value)
  }

  onMounted(() => {
    workspace.value = Blockly.inject('blocklyDiv', {
      toolbox: toolboxConfig,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 4,
        minScale: 0.3,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      grid: {
        spacing: 25,
        length: 3,
        colour: '#ccc',
        snap: true,
      },
      trashcan: true,
      renderer: 'zelos',
    })

    // Первый resize с небольшой задержкой (браузер ещё не дорисовал)
    setTimeout(resizeBlockly, 100)

    window.addEventListener('resize', resizeBlockly)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeBlockly)
    if (workspace.value) {
      workspace.value.dispose()
      workspace.value = null
    }
  })

  return {
    workspace,
    resizeBlockly,  // можно вернуть, если где-то понадобится вызвать вручную
  }
}