const Syntax = require("../core/Syntax");
class SpreadElement extends Syntax{
    emitter(){
        return this.make(this.stack.argument);
    }
}

module.exports = SpreadElement;