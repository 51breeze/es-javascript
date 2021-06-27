const Syntax = require("../core/Syntax");
class LogicalExpression extends Syntax{
     emiter(syntax){
          const left= this.stack.left.emiter( syntax );
          const right= this.stack.right.emiter( syntax );
          const operator = this.stack.node.operator;
          return `${left} ${operator} ${right}`;
     }
}

module.exports = LogicalExpression;