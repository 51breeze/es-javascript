const Syntax = require("../core/Syntax");
class JSXSpreadAttribute extends Syntax{
    emitter(){
        return this.make(this.stack.argument);
    }
}

module.exports = JSXSpreadAttribute;