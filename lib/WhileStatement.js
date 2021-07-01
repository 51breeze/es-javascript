const Syntax = require("../core/Syntax");
class WhileStatement extends Syntax{
     emiter(syntax){
          const condition = this.stack.condition.emiter(syntax);
          const body = this.stack.body ? this.stack.body.emiter(syntax) : null;
          const indent = this.getIndent();
          if( this.stack.body ){
               return `${indent}while(${condition}){\r\n${body}\r\n${indent}}`;
          }
          return `${indent}while(${condition});`;
     }
}

module.exports = WhileStatement;