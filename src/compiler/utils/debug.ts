// Вспомогательная функция для отрисовки дерева в консоли
export const debugPrint = (node: any, indent = "") => {
  if (!node) return "Пусто";

  let result = `${indent}┗━ [${node.type}] (id: ${node.id})\n`;

  // Если есть данные (например, message), выводим их
  if (node.data && Object.keys(node.data).length > 0) {
    const dataStr = JSON.stringify(node.data);
    result += `${indent}   content: ${dataStr}\n`;
  }

  // Если есть дети, рекурсивно идем вглубь
  if (node.children && node.children.length > 0) {
    node.children.forEach((child: any) => {
      result += debugPrint(child, indent + "   ");
    });
  }

  return result;
};