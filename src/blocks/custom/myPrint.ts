// src/blocks/custom/myPrint.ts
import * as Blockly from 'blockly/core';

export function registerMyPrint() {
  Blockly.Blocks['my_print'] = {
    init: function() {
      this.appendValueInput('MESSAGE')           // вход для текста/выражения
        .setCheck(null)                          // можно подключать любой тип
        .appendField('print');                   // надпись слева

      this.setPreviousStatement(true, null);     // можно соединять сверху
      this.setNextStatement(true, null);         // можно соединять снизу
      this.setColour(160);                       // зелёный оттенок, как текст
      this.setTooltip('Выводит сообщение');
      this.setHelpUrl('');                       // можно ссылку на документацию
    }
  };

  // Пока без генератора — добавим позже
}