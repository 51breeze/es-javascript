const Syntax = require("../core/Syntax");
class EmptyStatement extends Syntax{
     emitter(){
          return null;
     }
}
module.exports = EmptyStatement;