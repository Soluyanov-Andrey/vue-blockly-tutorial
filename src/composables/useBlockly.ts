import { onMounted, onUnmounted, ref } from 'vue'
import * as Blockly from 'blockly/core'
import toolboxConfig from '@/toolbox/toolbox.json'
import { registerMyPrint } from '@/blocks/custom/myPrint';
// Импортируем созданную функцию генерации
import { generateWorkspaceJson } from '@/generators/json';
import { patchBlocklyFocus } from '@/utils/patchBlockly';
import { registerGroupContainer } from '@/blocks/custom/groupContainer';

// Вызываем патч
patchBlocklyFocus();



export function useBlockly() {
  const workspace = ref<Blockly.WorkspaceSvg | null>(null)
  // 1. Добавляем реактивную переменную для JSON
  const latestJson = ref<any>(null)
  // Список всех наших уникальных ID (позже можно вынести в JSON)
 const ALL_DEVICES = [
    { id: 'block_01', name: 'Блок-1', type: 'my_print' },
    { id: 'block_02', name: 'Блок-2', type: 'my_print' },
    { id: 'block_03', name: 'Блок-3', type: 'my_print' },
    { id: 'block_04', name: 'Блок-4', type: 'my_print' },
    { id: 'block_05', name: 'Блок-5', type: 'my_print' },
    { id: 'block_06', name: 'Блок-6', type: 'my_print' },
    { id: 'block_07', name: 'Блок-7', type: 'my_print' },
    { id: 'block_08', name: 'Блок-8', type: 'my_print' },
    { id: 'block_09', name: 'Блок-9', type: 'my_print' },
    { id: 'container_01', name: 'Верхняя секция', type: 'group_container' },
    { id: 'container_02', name: 'Средняя секция', type: 'group_container' },
    { id: 'container_03', name: 'Нижняя секция', type: 'group_container' }
  ];



let lastUsedIdsStr = "";


function updateToolbox(ws: Blockly.WorkspaceSvg) {
  const usedIds = ws.getAllBlocks(false).map(b => b.id);
  const currentUsedIdsStr = usedIds.sort().join(',');

  if (currentUsedIdsStr === lastUsedIdsStr) return;
  
  const toolboxDef = ws.options.languageTree;
  if (!toolboxDef || !toolboxDef.contents) return;

  // 1. Создаем глубокую копию текущего конфига тулбокса
  const newToolboxConfig = JSON.parse(JSON.stringify(toolboxDef));

  // 2. Вспомогательная функция для обновления категории
  const fillCategory = (categoryName: string, blockType: string) => {
    const category = newToolboxConfig.contents.find(
      (c: any) => c.kind === 'category' && c.name === categoryName
    );

    if (category) {
      // Фильтруем ALL_DEVICES: берем только нужный тип и только те, что НЕ на поле
      const available = ALL_DEVICES.filter(d => d.type === blockType && !usedIds.includes(d.id));
      
      category.contents = available.map(d => ({
        'kind': 'block',
        'type': d.type,
        'id': d.id,
        'fields': { 'NAME': d.name }
      }));
    }
  };

  // 3. Обновляем обе вкладки
  fillCategory("Мои блоки", "my_print");
  fillCategory("Контейнеры", "group_container");

  // --- Далее ваш проверенный код с ХАКом фокуса ---
  const focusMgr = (Blockly as any).focusManager;
  const originalFocus = focusMgr?.focusNode;
  
  if (focusMgr) {
    focusMgr.focusNode = () => {}; 
  }

  setTimeout(() => {
    try {
      lastUsedIdsStr = currentUsedIdsStr;
      ws.updateToolbox(newToolboxConfig);
      
      setTimeout(() => {
        if (focusMgr) focusMgr.focusNode = originalFocus;
      }, 50);
    } catch (e) {
      console.warn("Toolbox update skipped:", e);
    }
  }, 100);
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
    
    if (typeof registerMyPrint === 'function') registerMyPrint();
      registerGroupContainer(); 

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

  return { workspace, resizeBlockly, latestJson }
}