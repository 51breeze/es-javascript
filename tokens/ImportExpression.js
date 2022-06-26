const Token = require("../core/Token");
class ImportExpression extends Token{
   
   emitter(){
      const file = this.stack.source.value();
      return this.semicolon(`import('${file}')`)
   }

   constructor(stack){
      super(stack);
      this.source = this.createToken( stack.source );
   }
}

module.exports = ImportExpression;