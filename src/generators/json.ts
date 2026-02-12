import * as Blockly from 'blockly/core'
export const jsonGenerator = new Blockly.CodeGenerator('JSON')

jsonGenerator.ORDER_ATOMIC = 0
jsonGenerator.ORDER_NONE = 0

// Настраиваем отступы (необязательно, но полезно для отладки)
jsonGenerator.INDENT = '  '

/**
 * Блок my_print
 */
jsonGenerator.forBlock['my_print'] = function(block, generator) {
  // Создаем объект текущего блока
  const blockData: any = {
    type: 'custom_print',
    id: block.id,
    message: block.getFieldValue('MESSAGE') || 'нет текста'
  }

  // 1. Если есть вложенные блоки (Value Inputs)
  // Допустим, у вас будет блок, внутрь которого можно вставить другой
  // const value = generator.valueToCode(block, 'INPUT_NAME', 0);
  // if (value) blockData.value = JSON.parse(value);

  // 2. РЕШЕНИЕ: Обработка следующего блока через рекурсию
  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    // Вызываем генерацию для следующего блока и вкладываем результат в текущий
    const nextJson = generator.blockToCode(nextBlock);
    if (nextJson) {
      blockData.next = JSON.parse(nextJson);
    }
  }

  // Возвращаем строку-объект
  return JSON.stringify(blockData);
}

/**
 * Блок group_container
 */
jsonGenerator.forBlock['group_container'] = function(block, generator) {
  const blockData: any = {
    type: 'group_container',
    id: block.id,
    children: [] // Здесь будут лежать вложенные блоки
  };

  // 1. Обработка ВНУТРЕННИХ блоков (вход STACK)
  const firstInnerBlock = block.getInputTargetBlock('STACK');
  if (firstInnerBlock) {
    // blockToCode запустит цепочку: первый внутренний блок + его "next" соседи
    const innerJson = generator.blockToCode(firstInnerBlock);
    if (innerJson) {
      // Так как генератор возвращает строку, парсим её
      // Если блоков внутри много, они уже будут связаны через "next" внутри JSON
      blockData.children = [JSON.parse(innerJson as string)];
    }
  }

  // 2. Обработка СЛЕДУЮЩЕГО блока (после группы)
  const nextBlock = block.getNextBlock();
  if (nextBlock) {
    const nextJson = generator.blockToCode(nextBlock);
    if (nextJson) {
      blockData.next = JSON.parse(nextJson as string);
    }
  }

  return JSON.stringify(blockData);
}


/**
 * Важнейшая правка: scrub_ больше не должен приклеивать блоки через \n!
 * Теперь мы управляем вложенностью внутри самих функций блоков.
 */
jsonGenerator.scrub_ = function (block, code, thisOnly) {
  // Возвращаем только код самого блока. 
  return code;
}

/**
 * Обновленная функция генерации
 */
export function generateWorkspaceJson(workspace: Blockly.WorkspaceSvg | null): string {
  if (!workspace) return '[]'
  
  // Получаем только "головы" (блоки, у которых нет предыдущего соединения)
  const topBlocks = workspace.getTopBlocks(true);
  
  const result = topBlocks.map(block => {
    const code = jsonGenerator.blockToCode(block);
    try {
      return JSON.parse(code as string);
    } catch (e) {
      return { error: 'Failed to parse block', id: block.id };
    }
  });

  return JSON.stringify(result, null, 2);
}