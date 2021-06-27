const Syntax = require("../core/Syntax");
class ConditionalExpression extends Syntax{
     emiter( syntax ){
          const test = this.stack.test.emiter(syntax);
          const consequent = this.stack.consequent.emiter(syntax);
          const alternate = this.stack.alternate.emiter(syntax);
          return `${test} ? ${consequent} : ${alternate}`;
     }
}
module.exports = ConditionalExpression;