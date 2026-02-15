// src/compiler/index.ts
import { parseWorkspace } from './parser/index';
import { validateTasks } from './validator/index';
import { buildTree } from './transformer/index';
import { debugPrint } from './utils/debug';
import { assemble } from './assembler';

export const useCompiler = () => {
  const compile = (rawData: any) => {
    console.log("📥 [Compiler] Входящий поток из Blockly:", rawData);

    // --- ЭТАП 1: ПАРСИНГ ---
    // Превращаем дерево/лес блоков в плоский список задач с контекстом
    const tasks = parseWorkspace(rawData);
    
    // console.log("🛠️ [Parser] Результат нормализации (Tasks):", tasks);

    // --- ЭТАП 2: ВАЛИДАЦИЯ (Закомментировано) ---
    
    const validTasks = validateTasks(tasks);
    console.log("✅ [Validator] Очищенный список:", validTasks);
    

    // 3. ТРАНСФОРМЕР: Собираем финальное дерево (AST)
    const ast = buildTree(validTasks);

    if (ast.length > 0) {
      console.log("🌳 [Transformer] ВИЗУАЛИЗАЦИЯ ДЕРЕВА:");
      console.log(debugPrint(ast[0])); // Печатаем дерево текстом
    } else {
      console.log("🌳 [Transformer] Дерево пустое");
    }
    // 4. ФИНАЛЬНЫЙ ЭТАП: Прогоняем дерево через сигнатуры и маппинг
    // Мы берем корень дерева (ast[0]) и превращаем его в конфиг сайта
    const finalConfig = assemble(ast[0]);

    console.log("🚀 [Final Site Config]:", finalConfig);
    // Возвращаем результат. Если дерево пустое — вернем null или []
   return finalConfig;
  };

  return { compile };
};