const Syntax = require("../core/Syntax");
class Identifier extends Syntax{
     emitter(){
          const desc = this.stack.description();
          const module = this.module;

          if( desc && (desc.isMethodGetterDefinition || desc.isPropertyDefinition) ){
               return `this.${this.stack.value()}`;
          }

          if( module && this.compiler.callUtils("isClassType", desc) ){
               this.addDepend( desc );
               return module.getReferenceNameByModule( desc );
          }
          return this.stack.value();
     }
}
module.exports = Identifier;