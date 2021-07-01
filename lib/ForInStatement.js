const Syntax = require("../core/Syntax");
class ForInStatement extends Syntax{
   emiter( syntax ){
      const left = this.stack.left.emiter(syntax);
      const right = this.stack.right.emiter(syntax);
      const body = this.stack.body ? this.stack.body.emiter(syntax) : null;
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