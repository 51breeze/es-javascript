const Syntax = require("../core/Syntax");
class MethodDefinition extends Syntax{
    emitter(){
        return this.make(this.stack.expression);
    }
}

module.exports = MethodDefinition;