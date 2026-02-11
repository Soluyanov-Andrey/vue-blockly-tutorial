import * as Blockly from 'blockly/core';

export function registerMyPrint() {
  // Проверяем, не зарегистрирован ли блок уже, чтобы избежать ошибок при HMR
  if (Blockly.Blocks['my_print']) return;

  Blockly.Blocks['my_print'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(":")
          .appendField(new Blockly.FieldLabelSerializable(""), "NAME"); // Поле для имени
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(160);
      this.setTooltip("Уникальный блок");
    }
  };
}