const Syntax = require("../core/Syntax");
class WhileStatement extends Syntax{
     emitter(){
          const condition = this.make(this.stack.condition);
          const body = this.stack.body && this.make(this.stack.body);
          const indent = this.getIndent();
          if( body ){
               return `${indent}while(${condition}){\r\n${body}\r\n${indent}}`;
          }
          return `${indent}while(${condition});`;
     }
}

module.exports = WhileStatement;