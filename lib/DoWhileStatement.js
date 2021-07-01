const Syntax = require("../core/Syntax");
class DoWhileStatement extends Syntax{
   emiter( syntax ){
      const condition =  this.stack.condition.emiter(syntax);
      const body =  this.stack.body.emiter(syntax);
      const indent = this.getIndent();
      return `${indent}do{\r\n${body}\r\n${indent}}while(${condition});`;
   }
}

module.exports = DoWhileStatement;