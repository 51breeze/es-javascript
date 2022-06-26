const Syntax = require("../core/Syntax");
class TypeAssertExpression extends Syntax{
     emitter(){
          return this.make(this.stack.left);
     }
}
module.exports = TypeAssertExpression;