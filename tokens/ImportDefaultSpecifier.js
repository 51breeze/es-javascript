const Token = require("../core/Token");
class ImportDefaultSpecifier extends Token{
   createChildren(stack){
      this.local = this.createToken(stack.local);
   }
   make( gen ){
      this.local.make( gen );
   }
}
module.exports = ImportDefaultSpecifier;