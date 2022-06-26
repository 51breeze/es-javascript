const Token = require("../core/Token");
class Literal extends Token{
     emitter(){
          return this.stack.raw();
     }
     get value(){
          return this.stack.raw();
     }
}
module.exports = Literal;