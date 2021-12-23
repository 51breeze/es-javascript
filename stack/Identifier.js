const Syntax = require("../core/Syntax");
class Identifier extends Syntax{
     emitter(){
          const desc = this.stack.description();
          const module = this.module;
          if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) ){
               const pStack = this.stack.getParentStack( stack=>!!(stack.jsxElement || stack.isBlockStatement || stack.isExpressionStatement));
               if( pStack.jsxElement ){
                    if( desc.isMethodGetterDefinition || desc.isPropertyDefinition ){
                         return `this.${this.stack.value()}`;
                    }else{
                         return `this.${this.stack.value()}.bind(this)`;
                    }
               }
          }

          if( module && this.compiler.callUtils("isClassType", desc) ){
               this.addDepend( desc );
               return this.getModuleReferenceName(desc, module);
          }
          return this.stack.value();
     }
}
module.exports = Identifier;