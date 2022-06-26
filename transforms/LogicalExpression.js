const Syntax = require("../core/Syntax");
class LogicalExpression extends Syntax{
     emitter(){
          const left= this.make(this.stack.left);
          const right= this.make(this.stack.right);
          const operator = this.stack.node.operator;
          return `${left} ${operator} ${right}`;
     }
}

module.exports = LogicalExpression;