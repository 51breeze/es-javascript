const Syntax = require("../core/Syntax");
class ConditionalExpression extends Syntax{
     emitter(){
          const test = this.make(this.stack.test);
          const consequent = this.make(this.stack.consequent);
          const alternate = this.make(this.stack.alternate);
          return `${test} ? ${consequent} : ${alternate}`;
     }
}
module.exports = ConditionalExpression;