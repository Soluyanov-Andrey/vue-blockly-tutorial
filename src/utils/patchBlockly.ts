// src/utils/patchBlockly.ts
// Патч для известного бага Blockly FocusManager (Attempted to focus unregistered node)
// Безопасно глотаем ошибку при удалении/перемещении блоков

import * as Blockly from 'blockly/core';

export function patchBlocklyFocus() {
  try {
    const focusManager = (Blockly as any).FocusManager || (Blockly as any).internal?.FocusManager;
    
    if (focusManager?.prototype?.focusNode) {
      const original = focusManager.prototype.focusNode;
      focusManager.prototype.focusNode = function(node: any) {
        try {
          original.call(this, node);
        } catch (e) {
          if (String(e).includes('unregistered node')) {
            // глушим
          } else {
            throw e;
          }
        }
      };
      console.log('[Blockly Patch] FocusManager patched');
    }
  } catch (e) {
    console.error('[Blockly Patch] Failed to patch focus:', e);
  }
}