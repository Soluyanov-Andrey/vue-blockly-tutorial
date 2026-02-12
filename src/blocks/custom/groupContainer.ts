// src/blocks/custom/groupContainer.ts
import * as Blockly from 'blockly/core';

export const registerGroupContainer = () => {
  Blockly.Blocks['group_container'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Группировка")
          .appendField(new Blockly.FieldLabelSerializable("..."), "NAME");
      this.appendStatementInput("STACK") // Вход для вложенных блоков
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("Просто объединяет блоки внутри себя");
    }
  };
};

