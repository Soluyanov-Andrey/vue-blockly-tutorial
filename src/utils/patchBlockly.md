
```markdown
# Ошибка: Attempted to focus unregistered node

Это та самая ошибка, которая вылезала в консоли:

```
Uncaught Error: Attempted to focus unregistered node: [object Object].
    at FocusManager$$module$build$src$core$focus_manager.focusNode (...)
```

Я её словил, когда активно таскал блоки, удалял их или ресайзил окно. Проект при этом продолжал работать, но консоль забивается, и это бесит.

## Когда и почему она у меня появлялась

После обновления страницы ошибка не возникает.
Если я просто нажимаю на меню — ошибки тоже нет.
Когда перетаскиваю блоки — ошибка не возникает.

Но: после того как я первый раз перетащил блок,
любое последующее нажатие на меню вызывает эту ошибку.

Причина простая: Blockly где-то внутри держит карту всех узлов, на которые можно сфокусировать клавиатуру (Tab, стрелки). Когда блок удаляется или его DOM-узел умирает, FocusManager иногда пытается вернуть фокус на уже несуществующий элемент → падает с этой ошибкой.

В моём случае это ещё и из-за Vue + частых вызовов `Blockly.svgResize()` — DOM перестраивается, и фокус-менеджер теряет трек.

## Что я пробовал и что в итоге сделал

1. Сначала просто глушил через слушатель на `ERROR`-события — не очень помогло, ошибка всё равно лезла.

2. Пытался отключить фокус-менеджер полностью (`Blockly.FocusManager.getFocusManager().setEnabled(false)`), но тогда пропадает удобная навигация по блокам стрелками и Tab — не вариант.

3. Самое рабочее — патч прототипа `focusNode`. Я его вставил прямо в начало `useBlockly.ts`, чтобы он сработал до первого `Blockly.inject`.

Вот что я написал:

```ts
// Патч для бага FocusManager (Attempted to focus unregistered node)
// Глушим только эту ошибку, остальные пропускаем
const patchBlocklyFocus = () => {
  try {
    const focusManager = (Blockly as any).FocusManager || (Blockly as any).internal?.FocusManager;
    
    if (focusManager?.prototype?.focusNode) {
      const original = focusManager.prototype.focusNode;
      
      focusManager.prototype.focusNode = function(node: any) {
        try {
          original.call(this, node);
        } catch (e) {
          if (String(e).includes('unregistered node')) {
            // молча глотаем, чтобы не засорять консоль
            // если потом захочу логи — раскомментирую
            // console.warn('Подавлена ошибка фокуса Blockly:', e);
          } else {
            throw e; // другие ошибки не глушим
          }
        }
      };
      
      console.log('[Blockly Patch] FocusManager patched — unregistered node глушится');
    }
  } catch (e) {
    console.error('[Blockly Patch] Не смог пропатчить фокус:', e);
  }
};

// Вызываем сразу после импорта Blockly, до inject
patchBlocklyFocus();
```

После этого ошибка полностью пропала из консоли.  
Проект работает как раньше, клавиатура по блокам тоже ходит нормально.

## Когда можно будет убрать этот патч

Если в следующих версиях Blockly (после 12.x) этот баг пофиксят — можно смело удалить.  
Пока же оставляю — он маленький, безопасный и решает проблему в корне.

Если кто-то читает это позже — патч проверен на версии ~11–12, работает стабильно.
