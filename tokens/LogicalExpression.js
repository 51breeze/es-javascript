const Token = require("../core/Token");
class LogicalExpression extends Token{
     emitter(){
          const left= this.make(this.stack.left);
          const right= this.make(this.stack.right);
          const operator = this.stack.node.operator;
          return `${left} ${operator} ${right}`;
     }

     constructor(stack){
          super(stack);
          this.left= this.createToken(stack.left);
          this.right= this.createToken(stack.right);
          this.operator = stack.node.operator;
     }
}

module.exports = LogicalExpression;