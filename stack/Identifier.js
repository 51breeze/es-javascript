const Syntax = require("../core/Syntax");
class Identifier extends Syntax{
     emitter(){
          const desc = this.stack.description();
          const module = this.module;
          if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) ){

               const getThisName = ()=>{
                    let stack = this.stack.getParentStack( stack=>!!stack.isArrowFunctionExpression );
                    if( stack && stack.isArrowFunctionExpression ){
                         stack = stack.getParentStack( stack=>!!stack.isFunctionExpression );
                         if( stack.isProgram && stack.isJSXProgram && stack.body.length == 1){
                              stack = stack.body[0]
                          }
                         const name = this.generatorVarName(stack,"_this",true);
                         stack.dispatcher("insertThisName", name );
                         return name;
                    }
                    return 'this';
               }
               const ownerModule = desc.module;
               const isStatic = !!(desc.static || ownerModule.static);
               const target = isStatic ? ownerModule.id : getThisName();
               return `${target}.${this.stack.value()}`;

          }
          if( module && this.compiler.callUtils("isClassType", desc) ){
               this.addDepend( desc );
               return this.getModuleReferenceName(desc, module);
          }
          return this.stack.value();
     }
}
module.exports = Identifier;