const Syntax = require("../core/Syntax");
class TryStatement extends Syntax {
   emitter(){
      const name = this.make(this.stack.param);
      const handler=  this.make(this.stack.handler);
      const block  =  this.make(this.stack.block);
      const indent = this.getIndent();
      return `${indent}try{\r\n${block}\r\n${indent}}catch(${name}){\r\n${handler}\r\n${indent}}`;
   }
}

module.exports = TryStatement;