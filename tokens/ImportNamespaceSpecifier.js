const Token = require("../core/Token");
class ImportNamespaceSpecifier extends Token{

   createChildren(stack){
      this.local = this.createToken(stack.local);
   }

   make( gen ){
      gen.withString('*');
      gen.withOperator('as');
      this.local.make( gen );
   }

}
module.exports = ImportNamespaceSpecifier;