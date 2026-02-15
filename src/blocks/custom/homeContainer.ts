// src/blocks/custom/homeContainer.ts
import * as Blockly from 'blockly/core';

export const registerHomeContainer = () => {
  Blockly.Blocks['home_container'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("")
          .appendField(new Blockly.FieldLabelSerializable("..."), "NAME");
      this.appendStatementInput("STACK") // Вход для вложенных блоков
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip("HomeContainer");
    }
  };
};