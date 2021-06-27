const Syntax = require("../core/Syntax");
class TypeAssertExpression extends Syntax{
     emiter(syntax){
          return this.stack.left.emiter( syntax );
     }
}
module.exports = TypeAssertExpression;