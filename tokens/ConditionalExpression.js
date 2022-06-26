const Token = require("../core/Token");
class ConditionalExpression extends Token{
     createChildren(stack){
          this.test = this.createToken(stack.test);
          this.consequent = this.createToken(stack.consequent);
          this.alternate = this.createToken(stack.alternate);
     }
     make( gen ){
          this.test.make( gen );
          gen.withString(' ? ');
          this.consequent.make( gen );
          gen.withString(' : ');
          this.alternate.make( gen );
     }
}
module.exports = ConditionalExpression;