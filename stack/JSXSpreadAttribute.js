const Syntax = require("../core/Syntax");
class JSXSpreadAttribute extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXSpreadAttribute;