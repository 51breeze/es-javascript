const Syntax = require("../core/Syntax");
class TryStatement extends Syntax {
   emiter(syntax){
      const name = this.stack.param.emiter(syntax);
      const handler=  this.stack.handler.emiter(syntax);
      const block  =  this.stack.block.emiter(syntax);
      const indent = this.getIndent();
      return `${indent}try{\r\n${block}\r\n${indent}}catch(${name}){\r\n${handler}\r\n${indent}}`;
   }
}

module.exports = TryStatement;