const Syntax = require("../core/Syntax");
class Literal extends Syntax{
     emitter(){
          return this.stack.raw();
     }
}
module.exports = Literal;