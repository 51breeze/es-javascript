const Syntax = require("../core/Syntax");
class TypeTransformExpression extends Syntax{
     emiter(syntax){
          return this.stack.referExpression.emiter( syntax );
     }
}
module.exports = TypeTransformExpression;