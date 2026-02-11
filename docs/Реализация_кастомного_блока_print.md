## Что получилось — видео, условия задачи (см. ниже)
[Создание кастомного блока.webm](https://github.com/user-attachments/assets/2c28413b-7c9c-4ec8-83fe-c244e2a3632d)

# Шаг 01: Создание первого кастомного блока print (my_print)
Тег step-5 — это закладка. Перейдя по ней, можно посмотреть код.

## Зачем это нужно
- Это базовый тестовый блок, который подтверждает, что мы можем:
  - Регистрировать свои блоки
  - Добавлять их в toolbox
  - Перетаскивать на рабочий стол
- Позволяет проверить весь цикл: регистрация → toolbox → workspace
- Становится основой для дальнейшего расширения (имя, входы, вложенность, mutator, генерация JSON)

## Что делает блок
- Простой блок с надписью «print»
- Можно ставить в цепочку (previous/next)
- Пока без входов и настроек — чистый прототип
- Каждый перетащенный экземпляр получает уникальный автоматический ID от Blockly

## Как мы это сделали

### 1. Создание файла регистрации блока
Файл: `src/blocks/custom/myPrint.ts`

```ts
import * as Blockly from 'blockly/core';

export function registerMyPrint() {
  Blockly.Blocks['my_print'] = {
    init: function() {
      this.appendDummyInput()
        .appendField('print');

      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip('Простой тестовый блок print');
    }
  };
}
```

### 2. Подключение регистрации в composable
Файл: `src/composables/useBlockly.ts`

```ts
import { registerMyPrint } from '@/blocks/custom/myPrint';

// Внутри onMounted, перед Blockly.inject:
console.log('onMounted сработал — начинаем регистрацию блоков');
if (typeof registerMyPrint === 'function') {
  registerMyPrint();
  console.log('Блок my_print зарегистрирован');
}
```

### 3. Добавление блока в toolbox
Файл: `src/toolbox/toolbox.json`

Добавлена категория (или обновлена существующая):

```json
{
  "kind": "category",
  "name": "Мои блоки",
  "colour": "#A65C5C",
  "contents": [
    {
      "kind": "block",
      "type": "my_print"
    }
  ]
}
```

### 4. Результат после перезагрузки
- В боковой панели появляется категория «Мои блоки»
- В ней блок «print»
- Его можно перетаскивать на рабочую область любое количество раз
- Каждый экземпляр — отдельный блок с уникальным ID (генерируется Blockly)

### 5. Что проверяли
- Логи в консоли: «onMounted сработал», «Блок my_print зарегистрирован»
- Блок виден в toolbox и на рабочем столе
- Нет ошибок при перетаскивании

