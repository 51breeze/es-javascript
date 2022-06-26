const Token = require("../core/Token");
class ConditionalExpression extends Token{
     constructor(stack){
          super(stack);
          this.test = this.createToken(stack.test);
          this.consequent = this.createToken(stack.consequent);
          this.alternate = this.createToken(stack.alternate);
     }
}
module.exports = ConditionalExpression;