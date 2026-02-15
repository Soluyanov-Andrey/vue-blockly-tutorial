// src/compiler/validator/index.ts

const ALLOWED_CHILDREN: Record<string, string[]> = {
  // В Доме могут быть только Группы
  'home_container': ['group_container'], 
  
  // В Группе могут быть только Принты (Группу из списка УДАЛЯЕМ)
  'group_container': ['custom_print'], 
  
  'custom_print': []
};

export const validateTasks = (tasks: any[]) => {
  const root = tasks.find(t => t.type === 'home_container');
  if (!root) return [];

  const validIds = new Set<string>([root.id]);

  let changed = true;
  while (changed) {
    changed = false;
    tasks.forEach(task => {
      if (task.parentId && validIds.has(task.parentId) && !validIds.has(task.id)) {
        const parent = tasks.find(t => t.id === task.parentId);
        const allowed = ALLOWED_CHILDREN[parent.type] || [];
        
        if (allowed.includes(task.type)) {
          validIds.add(task.id);
          changed = true;
        } else {
          // Важный лог для отладки
          console.warn(`🚫 [Validator] Нарушение: ${task.type} не может быть внутри ${parent.type}`);
        }
      }
    });
  }

  return tasks.filter(task => validIds.has(task.id));
};