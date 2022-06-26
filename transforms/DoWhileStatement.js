const Syntax = require("../core/Syntax");
class DoWhileStatement extends Syntax{
   emitter(){
      const condition =  this.make(this.stack.condition);
      const body =  this.make(this.stack.body);
      const indent = this.getIndent();
      return `${indent}do{\r\n${body}\r\n${indent}}while(${condition});`;
   }
}

module.exports = DoWhileStatement;