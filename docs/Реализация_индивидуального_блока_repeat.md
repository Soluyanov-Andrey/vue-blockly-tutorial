# Создание уникальных блоков-контейнеров с динамическим Toolbox

В этой главе мы реализуем блок **«Группировка»**. В отличие от стандартных блоков, эти контейнеры должны быть уникальными (иметь свой ID) и исчезать из панели инструментов (Toolbox) сразу после того, как они были добавлены на рабочий стол.

## 1. Определение блока (Block Definition)

Создаем файл `src/blocks/custom/groupContainer.ts`. Чтобы блок мог отображать имя («Группа А», «Группа Б»), приходящее из Toolbox, мы используем `FieldLabelSerializable`.

```typescript
import * as Blockly from 'blockly/core';

export const registerGroupContainer = () => {
  Blockly.Blocks['group_container'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Группа:")
          .appendField(new Blockly.FieldLabelSerializable(""), "NAME");
      
      // Вход для вложенных блоков
      this.appendStatementInput("STACK")
          .setCheck(null);
          
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
    }
  };
};

```

## 2. Настройка уникальных экземпляров (Toolbox JSON)

В файле `src/toolbox/toolbox.json` мы заранее определяем конкретные экземпляры групп с уникальными `id`. Это позволяет нам управлять ими как отдельными сущностями.

```json
{
  "kind": "category",
  "name": "Контейнеры",
  "colour": "#995ba5",
  "contents": [
    { 
      "kind": "block", 
      "type": "group_container", 
      "id": "container_01", 
      "fields": { "NAME": "Группа А" } 
    },
    { 
      "kind": "block", 
      "type": "group_container", 
      "id": "container_02", 
      "fields": { "NAME": "Группа Б" } 
    }
  ]
}

```

## 3. Логика динамического обновления (useBlockly.ts)

Чтобы контейнеры исчезали из меню при использовании, мы модифицируем функцию `updateToolbox`. Основная задача — фильтровать массив всех доступных устройств (`ALL_DEVICES`) и распределять их по соответствующим категориям.

### Алгоритм обновления:

1. Получаем список `id` всех блоков, уже находящихся на рабочем столе.
2. Делаем глубокую копию конфигурации Toolbox.
3. Используем вспомогательную функцию `fillCategory`, которая:
* Находит нужную категорию по имени.
* Фильтрует блоки по типу и отсутствию их `id` на рабочем столе.
* Перезаписывает поле `contents` категории.



```typescript
const fillCategory = (categoryName: string, blockType: string) => {
  const category = newToolboxConfig.contents.find(
    (c: any) => c.kind === 'category' && c.name === categoryName
  );

  if (category) {
    const available = ALL_DEVICES.filter(d => d.type === blockType && !usedIds.includes(d.id));
    category.contents = available.map(d => ({
      'kind': 'block',
      'type': d.type,
      'id': d.id,
      'fields': { 'NAME': d.name }
    }));
  }
};

// Применяем для разных вкладок
fillCategory("Мои блоки", "my_print");
fillCategory("Контейнеры", "group_container");

```

## 4. Генерация древовидного JSON

Поскольку мы работаем с JSON-генератором, блок группировки должен собирать данные из входа `STACK`.

В файле `src/generators/json.ts`:

* Мы используем `generator.blockToCode(firstInnerBlock)` для рекурсивного обхода блоков внутри контейнера.
* Результат сохраняем в массив `children`.
* Соседние блоки (идущие после контейнера) сохраняем в свойство `next`.

---

## Резюме реализации

* **Уникальность**: Каждый контейнер — это личность с `id`.
* **Синхронизация**: `updateToolbox` следит за тем, чтобы в меню не было дубликатов.
* **Структура**: Мы получаем не плоский список команд, а дерево, которое идеально подходит для рендеринга Vue-компонентов на "Сайте".

