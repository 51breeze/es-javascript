const Token = require("../core/Token");
class ImportExpression extends Token{
   
   createChildren( stack ){
      this.source = this.createToken( stack.source );
   }

   make( gen ){
      gen.newLine();
      gen.withString(`import`);
      gen.withParenthesL();
      this.source.make( gen );
      gen.withParenthesR();
      gen.withSemicolon();
   }
}

module.exports = ImportExpression;