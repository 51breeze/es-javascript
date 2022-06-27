const Token = require("../core/Token");
class Identifier extends Token{

     getValue(){
          const desc = this.stack.description();
          const module = this.module;
          if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) ){
               const ownerModule = desc.module;
               const isStatic = !!(desc.static || ownerModule.static);
               const target = isStatic ? ownerModule.id : 'this';
               return `${target}.${this.stack.value()}`;
          }
          if( module && this.compiler.callUtils("isClassType", desc) ){
               this.addDepend( desc );
               return this.getModuleReferenceName(desc, module);
          }
     }

     make( gen ){
          gen.withString( this.getValue() );
     }
}
module.exports = Identifier;