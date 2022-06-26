const Syntax = require("../core/Syntax");
class TypeTransformExpression extends Syntax{
     emitter(){
          return this.make(this.stack.referExpression);
     }
}
module.exports = TypeTransformExpression;