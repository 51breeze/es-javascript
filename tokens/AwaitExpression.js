const Token = require("../core/Token");
class AwaitExpression extends Token{
     createChildren(stack){
          this.argument = this.createToken(stack.argument);
     }
     make(gen){
          gen.withString('await');
          gen.withSpace();
          this.argument.make( gen );
     }
}
module.exports = AwaitExpression;