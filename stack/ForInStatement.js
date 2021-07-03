const Syntax = require("../core/Syntax");
class ForInStatement extends Syntax{
   emitter(){
      const left = this.make(this.stack.left);
      const right = this.make(this.stack.right);
      const body = this.stack.body && this.make(this.stack.body);
      const indent = this.getIndent();
      if( !this.stack.body ){
         return this.semicolon(`for(${left} in ${right})`);
      }
      if( body ){
         return `${indent}for(${left} in ${right}){\r\n${body}\r\n${indent}}`;
      }
      return `${indent}for(${left} in ${right}){\r\n${indent}}`;
   }
}

module.exports = ForInStatement;