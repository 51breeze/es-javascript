const Utils = require("../../core/Utils");
const Syntax = require("../core/Syntax");
class BinaryExpression extends Syntax{
     emiter( syntax ){
          const left = this.stack.left.emiter(syntax);
          const right = this.stack.right.emiter(syntax);
          const operator = this.stack.node.operator;
          if( operator ==="is" || operator==="instanceof" ){
               const type = this.stack.right.type();
               if( operator!=="instanceof" ){
                    if( Utils.isGloableModule(type) ){
                         return `${left} instanceof ${right}`;
                    }
                    return `System.is(${left},${right})`;
               }
          }
          return `${left} ${operator} ${right}`;
     }
}
module.exports = BinaryExpression;