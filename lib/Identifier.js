const Syntax = require("../core/Syntax");
class Identifier extends Syntax{
     emiter(){
          const desc = this.stack.description();
          const module = this.module;
          if( module && this.compiler.callUtils("isClassType", desc) ){
               if( this.compiler.callUtils("checkDepend", desc) ){
                  return `${this.checkRefsName("System")}.getClass(${this.getIdByModule(desc)})`;
               }else{
                  return module.getReferenceNameByModule( desc );
               }
          }
          return this.stack.value();
     }
}
module.exports = Identifier;