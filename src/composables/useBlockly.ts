import { onMounted, onUnmounted, ref } from 'vue'
import * as Blockly from 'blockly/core'
import toolboxConfig from '@/toolbox/toolbox.json'
import { registerMyPrint } from '@/blocks/custom/myPrint';
// Импортируем созданную функцию генерации
import { generateWorkspaceJson } from '@/generators/json';
import { patchBlocklyFocus } from '@/utils/patchBlockly';


// Вызываем патч
patchBlocklyFocus();



export function useBlockly() {
  const workspace = ref<Blockly.WorkspaceSvg | null>(null)

  // Список всех наших уникальных ID (позже можно вынести в JSON)
  const ALL_DEVICES = [
    { id: 'block_01', name: 'Блок-1' },
    { id: 'block_02', name: 'Блок-2' },
    { id: 'block_03', name: 'Блок-3' }
  ];



let lastUsedIdsStr = "";


function updateToolbox(ws: Blockly.WorkspaceSvg) {
  const usedIds = ws.getAllBlocks(false).map(b => b.id);
  const currentUsedIdsStr = usedIds.sort().join(',');

  if (currentUsedIdsStr === lastUsedIdsStr) return;
  
  const availableDevices = ALL_DEVICES.filter(device => !usedIds.includes(device.id));
  const categoryContents = availableDevices.map(device => ({
    'kind': 'block',
    'type': 'my_print',
    'id': device.id,
    'fields': { 'NAME': device.name }
  }));

  const toolboxDef = ws.options.languageTree;
  if (toolboxDef && toolboxDef.contents) {
    const newToolboxConfig = JSON.parse(JSON.stringify(toolboxDef));
    const category = newToolboxConfig.contents.find(
      (c: any) => c.kind === 'category' && c.name === "Мои блоки"
    );

    if (category) {
      category.contents = categoryContents;
      
      // ХАК: Временно отключаем FocusManager перед обновлением
      // Это предотвратит попытку Blockly сфокусироваться на удаленном узле
      const focusMgr = (Blockly as any).focusManager;
      const originalFocus = focusMgr?.focusNode;
      
      if (focusMgr) {
        focusMgr.focusNode = () => {}; // Подменяем на пустую функцию
      }

      setTimeout(() => {
        try {
          lastUsedIdsStr = currentUsedIdsStr;
          ws.updateToolbox(newToolboxConfig);
          
          // Возвращаем фокус на место через мгновение
          setTimeout(() => {
            if (focusMgr) focusMgr.focusNode = originalFocus;
          }, 50);
          
        } catch (e) {
          console.warn("Toolbox update skipped:", e);
        }
      }, 100);
    }
  }
}



  // Функция, которая будет вызываться при любом изменении в Blockly
function handleWorkspaceChange(event: any) {
  if (!workspace.value) return;

  // 1. ПОЛНОСТЬЮ ИГНОРИРУЕМ UI-СОБЫТИЯ (клики по меню, выделение блоков)
  // Это предотвратит ошибку "focus unregistered node" при нажатии на категорию
  if (event.isUiEvent) return;

  // 2. JSON в консоль — только при значимых изменениях
  const isFinishedAction = !event.isDrag && (
    event.type === Blockly.Events.BLOCK_MOVE || 
    event.type === Blockly.Events.BLOCK_CREATE || 
    event.type === Blockly.Events.BLOCK_DELETE || 
    event.type === Blockly.Events.BLOCK_CHANGE
  );

  if (isFinishedAction) {
    const json = generateWorkspaceJson(workspace.value);
    console.log("--- Final JSON ---", json);
  }

  // 3. ОБНОВЛЕНИЕ ТУЛБОКСА — только когда состав блоков изменился физически
  // Мы убираем BLOCK_MOVE отсюда, чтобы не трогать меню во время таскания
  if (event.type === Blockly.Events.BLOCK_CREATE || event.type === Blockly.Events.BLOCK_DELETE) {
    // Вызываем обновление с небольшой задержкой, чтобы Blockly успел "закрыть" транзакцию создания
    setTimeout(() => {
        if (workspace.value) {
            updateToolbox(workspace.value);
        }
    }, 100);
  }
}


  function resizeBlockly() {
   
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
      // ... настройки (zoom, grid, renderer: 'zelos') ...
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