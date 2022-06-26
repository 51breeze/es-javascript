const Token = require("../core/Token");
class ImportDeclaration extends Token{
   emitter(){
      const classModule = this.stack.getModuleById( this.stack.specifiers.value() );
      const name = this.stack.alias ? this.stack.alias.value() : classModule.id;
      const indent = this.getIndent();
      return indent+this.emitImportClass(classModule, name );
   }

   constructor(stack){
      this.specifiers = this.createToken(stack.specifiers);
   }

}
module.exports = ImportDeclaration;