const Syntax = require("../core/Syntax");
class ImportDeclaration extends Syntax{
   emitter(){
      const classModule = this.stack.getModuleById( this.stack.specifiers.value() );
      const name = this.stack.alias ? this.stack.alias.value() : classModule.id;
      const indent = this.getIndent();
      return indent+this.emitImportClass(classModule, name );
   }
}
module.exports = ImportDeclaration;