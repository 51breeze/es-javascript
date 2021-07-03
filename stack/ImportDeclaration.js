const Syntax = require("../core/Syntax");
class ImportDeclaration extends Syntax{
   emitter(){
      const classModule = this.stack.getModuleById( this.stack.specifiers.value() );
      const name = this.stack.alias ? this.stack.alias.value() : classModule.id;
      const id = this.getIdByModule( classModule );
      const config = this.getConfig();
      if( config.pure ){
         return this.semicolon(`var ${name} = ${classModule.getName()}`);
      }else{
         return this.semicolon(`var ${name} = System.getClass(${id})`);
      }
   }
}
module.exports = ImportDeclaration;