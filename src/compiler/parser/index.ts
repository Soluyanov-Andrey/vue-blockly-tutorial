// src/compiler/parser/index.ts

export const parseWorkspace = (rawData: any): any[] => {
  const tasks: any[] = [];
  let blocks: any[] = [];

  // 1. Пытаемся превратить входные данные в массив объектов
  try {
    blocks = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    if (!Array.isArray(blocks)) {
        blocks = [blocks]; // На случай, если пришел один объект
    }
  } catch (e) {
    console.error("❌ [Parser] Ошибка парсинга входящей строки:", e);
    return [];
  }

  // 2. Внутренняя функция обхода
  const walk = (nodes: any[], parentId: string | null = null) => {
    // console.log("🔍 [Parser] Рекурсия зашла в:", nodes); // Раскомментируй для глубокой отладки

    nodes.forEach(node => {
      if (!node || typeof node !== 'object') return;

      // Извлекаем системные поля, остальное — в payload
      const { id, type, children, next, ...payload } = node;
      
      // Добавляем блок в плоский список
      tasks.push({
        id: id || `auto_${Math.random().toString(36).substr(2, 9)}`,
        type: type,
        parentId: parentId,
        data: payload
      });

      // Если есть вложенные (дети)
      if (children && Array.isArray(children) && children.length > 0) {
        walk(children, id);
      } else if (children && typeof children === 'object' && !Array.isArray(children)) {
        // Если Blockly прислал одиночный объект в children вместо массива
        walk([children], id);
      }
      
      // Если есть примагниченные снизу (соседи)
      if (next) {
        // У соседа тот же родитель, что и у текущего блока
        walk(Array.isArray(next) ? next : [next], parentId);
      }
    });
  };

  // 3. Запускаем процесс
  if (blocks.length > 0) {
    walk(blocks);
  }

  return tasks;
};