const Syntax = require("../core/Syntax");
const Utils = require("../../core/Utils");
class Identifier extends Syntax{
     emiter(syntax){
          const desc = this.stack.description();
          const module = this.module;
          if( Utils.isTypeModule(desc) ){
               desc.used = true;
          }
          if( module && Utils.isClassType(desc) ){
               if( Utils.checkDepend(module,desc) ){
                  return `${this.checkRefsName("System")}.getClass(${this.getIdByModule(desc)})`;
               }else{
                  return module.getReferenceNameByModule( desc );
               }
          }
          return this.stack.value();
     }
}
module.exports = Identifier;