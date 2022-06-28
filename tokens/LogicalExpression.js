const Token = require("../core/Token");
class LogicalExpression extends Token{
     createChildren(stack){
          this.left= this.createToken(stack.left);
          this.right= this.createToken(stack.right);
          this.operator = stack.node.operator;
     }
     make( gen ){
          this.left.make( gen );
          gen.withOperator( this.operator );
          this.right.make( gen );
     }
}

module.exports = LogicalExpression;