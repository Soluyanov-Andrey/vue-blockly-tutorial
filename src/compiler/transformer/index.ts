//Маппинг и обогащение данными
// src/compiler/transformer/index.ts

export const buildTree = (tasks: any[]) => {
  // 1. Создаем карту (Map), чтобы мгновенно находить блоки по ID
  // Мы создаем копии объектов, чтобы не мутировать исходные таски
  const taskMap: Record<string, any> = {};
  
  tasks.forEach(task => {
    taskMap[task.id] = { 
        ...task, 
        children: [] // Сюда мы будем складывать вложенные блоки
    };
  });

  const tree: any[] = [];

  // 2. Связываем детей с родителями
  tasks.forEach(task => {
    const currentItem = taskMap[task.id];
    
    if (task.parentId && taskMap[task.parentId]) {
      // Если у блока есть родитель и он в нашем "белом списке"
      taskMap[task.parentId].children.push(currentItem);
    } else if (task.type === 'home_container') {
      // Если родителя нет и это наш корень — добавляем в основу дерева
      tree.push(currentItem);
    }
  });

  return tree;
};