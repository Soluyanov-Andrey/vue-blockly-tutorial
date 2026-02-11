import { onMounted, onUnmounted, ref } from 'vue'
import * as Blockly from 'blockly/core'
import toolboxConfig from '@/toolbox/toolbox.json'
import { registerMyPrint } from '@/blocks/custom/myPrint';
// Импортируем вашу функцию генерации
import { generateWorkspaceJson } from '@/generators/json';

export function useBlockly() {
  const workspace = ref<Blockly.WorkspaceSvg | null>(null)

  // Функция, которая будет вызываться при любом изменении в Blockly
  function handleWorkspaceChange(event: any) {
    if (!workspace.value) return;

    // Игнорируем события интерфейса (например, просто открытие тулбокса),
    // чтобы не спамить в консоль. Реагируем только на действия с блоками.
    const isUiEvent = event.isUiEvent;
    if (isUiEvent) return;

    // Генерируем JSON с помощью вашей функции
    const jsonOutput = generateWorkspaceJson(workspace.value);
    
    console.log('--- Current Workspace JSON ---');
    console.log(jsonOutput);
  }

  function resizeBlockly() {
    // ... ваш код resizeBlockly без изменений ...
    if (!workspace.value) return
    const blocklyArea = document.getElementById('blocklyArea')
    const blocklyDiv = document.getElementById('blocklyDiv')
    if (!blocklyArea || !blocklyDiv) return
    let element: HTMLElement | null = blocklyArea
    let x = 0; let y = 0
    do { x += element.offsetLeft; y += element.offsetTop; element = element.offsetParent as HTMLElement } while (element)
    blocklyDiv.style.left = `${x}px`; blocklyDiv.style.top = `${y}px`
    blocklyDiv.style.width = `${blocklyArea.offsetWidth}px`; blocklyDiv.style.height = `${blocklyArea.offsetHeight}px`
    Blockly.svgResize(workspace.value)
  }

  onMounted(() => {
    if (typeof registerMyPrint === 'function') {
      registerMyPrint()
    }
    
    workspace.value = Blockly.inject('blocklyDiv', {
      toolbox: toolboxConfig,
      // ... ваши настройки (zoom, grid, renderer: 'zelos') ...
      trashcan: true,
      renderer: 'zelos',
    })

    // ВАЖНО: Вешаем слушатель событий сразу после создания workspace
    workspace.value.addChangeListener(handleWorkspaceChange);

    setTimeout(resizeBlockly, 100)
    window.addEventListener('resize', resizeBlockly)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeBlockly)
    if (workspace.value) {
      // Удаляем слушатель перед удалением самого workspace
      workspace.value.removeChangeListener(handleWorkspaceChange);
      workspace.value.dispose()
      workspace.value = null
    }
  })

  return { workspace, resizeBlockly }
}