const Token = require("../core/Token");
class ImportSpecifier extends Token{

   createChildren(stack){
      this.imported = this.createToken(stack.imported);
      this.local = this.createToken(stack.local);
   }

   make( gen ){
      if( this.imported ){
         this.imported.make( gen );
         gen.withOperator('as');
         this.local.make( gen );
      }else{
         this.local.make( gen );
      }
   }

}
module.exports = ImportSpecifier;