// src/compiler/assembler/index.ts
import { SIGNATURES } from '../signatures';
import { blocksMapping } from '../mapping/blocks';

export const assemble = (node: any): any => {
  if (!node) return null;

  // 1. Рекурсия для детей
  const childrenCode = node.children 
    ? node.children.map((child: any) => assemble(child)).filter(Boolean)
    : [];

  // 2. ПОИСК КОНФИГА (Проверяем и ID, и TYPE)
  // Сначала ищем по ID (если это конкретный экземпляр), 
  // потом по TYPE (если маппинг привязан к типу блока)
  const config = (blocksMapping as any)[node.id] || (blocksMapping as any)[node.type];

  // --- ДИАГНОСТИКА ---
  if (!config && node.type !== 'home_container') {
    console.group(`🔍 [Assembler Debug] Не нашел маппинг для блока`);
    console.log(`ID блока: "${node.id}"`);
    console.log(`Type блока: "${node.type}"`);
    console.log(`Доступные ключи в маппинге:`, Object.keys(blocksMapping));
    console.groupEnd();
    return null;
  }
  // -------------------

  // 3. ОБРАБОТКА КОРНЯ (Home Container)
  if (node.type === 'home_container') {
    return childrenCode; // Просто возвращаем массив строк
  }

  // 4. ВЫЗОВ СИГНАТУР
  try {
    switch (config.sig) {
      case 'row':
        const row = SIGNATURES.layout.row(node.id, config.title);
        row.blocks = childrenCode;
        return row;

      case 'image':
        return SIGNATURES.content.image(node.id, config.title, config.src);

      case 'text':
        // Важно: берем текст либо из маппинга, либо из данных блока
        const content = config.content || node.data.message || 'Пусто';
        return SIGNATURES.content.text(node.id, config.title, content);

      default:
        return null;
    }
  } catch (error) {
    console.error(`❌ Ошибка в сигнатуре ${config.sig}:`, error);
    return null;
  }
};