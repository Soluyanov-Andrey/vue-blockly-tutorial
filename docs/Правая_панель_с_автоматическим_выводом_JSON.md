# Добавление правой боковой панели с выводом JSON в Blockly-редакторе

[Правая_панель_с_автоматическим_выводом_JSON.webm](https://github.com/user-attachments/assets/fdc4fd9c-db49-4f8c-868f-3e78d39c35e5)

Работа была разделена на **три последовательных шага**, чтобы избежать поломок и понять, где что идёт не так.

### Шаг 1 — Добавление структуры панели (пустая панель справа)

**Что сделали:**
- Обернули весь контент в контейнер с `display: flex`
- Левую часть (#blocklyArea) сделали `flex: 1` — она занимает всё доступное пространство слева
- Справа добавили фиксированную панель `.side-panel` шириной 380px

**Изменения в коде:**
- В `<template>`:
  ```vue
  <div class="app-layout">
    <div id="blocklyArea">
      <div id="blocklyDiv"></div>
    </div>
    <div class="side-panel">
      <h3>Панель (пока пустая)</h3>
      <p>Здесь будет JSON или код</p>
    </div>
  </div>
  ```
- В `<style>`:
  ```css
  .app-layout { display: flex; height: 100vh; width: 100vw; }
  #blocklyArea { flex: 1; position: relative; min-width: 300px; }
  .side-panel { width: 380px; background: #f8f9fa; border-left: 1px solid #dee2e6; padding: 16px; box-sizing: border-box; }
  ```

**Результат шага:**  
Появилась видимая правая панель, Blockly остался слева и продолжал работать (toolbox открывался, блоки перетаскивались).  
На этом этапе JSON ещё не выводился — панель была просто заглушкой.

### Шаг 2 — Настройка корректного отображения при любом размере окна

**Проблема, которую решали:**  
При расширении окна > ~1000–1200 px правая панель визуально «исчезала» (выталкивалась за пределы экрана, появлялся белый фон справа).

**Что исправили:**
- Убрали `inset: 0` из `#blocklyDiv` (чтобы не полагаться на него)
- Вернули явное задание `left`, `top`, `width`, `height` в функции `resizeBlockly`
- Упростили `resizeBlockly` — теперь она всегда явно задаёт размеры контейнера
- Добавили `min-width` на `.app-layout` и `#blocklyArea`, чтобы предотвратить чрезмерное сжатие/растяжение
- Убрали или закомментировали `overflow: hidden` на `html, body, #app` (это часто ломало absolute-позиционирование при resize)

**Изменения в `resizeBlockly`:**
```ts
function resizeBlockly() {
  if (!workspace) return
  const blocklyArea = document.getElementById('blocklyArea')
  const blocklyDiv = document.getElementById('blocklyDiv')
  if (!blocklyArea || !blocklyDiv) return

  const width = blocklyArea.offsetWidth
  const height = blocklyArea.offsetHeight

  blocklyDiv.style.left   = '0px'
  blocklyDiv.style.top    = '0px'
  blocklyDiv.style.width  = width + 'px'
  blocklyDiv.style.height = height + 'px'

  Blockly.svgResize(workspace)
}
```

**Результат шага:**  
Панель справа стала видимой при любом размере окна.  
Blockly корректно растягивался слева, toolbox и блоки работали стабильно.

### Шаг 3 — Вывод JSON с координатами блоков в реальном времени

**Что добавили:**
- Реактивную переменную `workspaceJson` для хранения строки JSON
- Функцию `updateWorkspaceJson()`, которая:
  - берёт текущее состояние через `Blockly.serialization.workspaces.save(workspace)`
  - преобразует его в читаемый JSON с отступами (`JSON.stringify(..., null, 2)`)
- Автоматическое обновление:
  - `workspace.addChangeListener(...)` — обновляет JSON при каждом изменении блоков (перетаскивание, соединение, удаление)
  - Первое обновление через `setTimeout(updateWorkspaceJson, 300)`
- Отображение в `<pre>` внутри правой панели

**Добавленные строки в `<script setup>`:**
```ts
const workspaceJson = ref<string>('')

// В onMounted после Blockly.inject:
workspace?.addChangeListener(() => {
  updateWorkspaceJson()
})
setTimeout(updateWorkspaceJson, 300)

// Новая функция в конце:
function updateWorkspaceJson() {
  if (!workspace) {
    workspaceJson.value = '// Workspace ещё не готов'
    return
  }
  try {
    const state = Blockly.serialization.workspaces.save(workspace)
    workspaceJson.value = JSON.stringify(state, null, 2)
  } catch (error) {
    console.error('Ошибка сериализации JSON:', error)
    workspaceJson.value = '// Ошибка: ' + String(error)
  }
}
```

**В `<template>` (внутри панели):**
```vue
<h3>JSON с координатами блоков</h3>
<pre class="json-pre">{{ workspaceJson }}</pre>
```

**Результат шага:**  
При перетаскивании любого блока (move_robot, stop_robot) в правой панели автоматически появляется и обновляется JSON, содержащий:
- тип блока (`type`)
- уникальный id
- координаты (`x`, `y`)
- значения полей (например, SPEED: "100")

Пример вывода:
```json
{
  "blocks": {
    "blocks": [
      {
        "type": "move_robot",
        "id": "...",
        "x": 142,
        "y": 68,
        "fields": {
          "SPEED": "100"
        }
      }
    ]
  }
}
```

### Итог

Мы добавили стабильную правую панель с автоматическим выводом JSON-состояния Blockly-рабочей области (включая координаты блоков) в три этапа:

1. Добавили flex-структуру и пустую панель справа  
2. Исправили поведение при изменении размера окна (явные размеры + упрощённый resize)  
3. Подключили сериализацию JSON и авто-обновление при каждом изменении блоков

Теперь у нас есть надёжная основа для дальнейших иследований.
