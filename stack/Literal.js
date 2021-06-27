const Syntax = require("../core/Syntax");
class Literal extends Syntax{
     emiter(syntax){
          return this.stack.raw();
     }
}
module.exports = Literal;