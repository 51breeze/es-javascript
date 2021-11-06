const Syntax = require("../core/Syntax");
class JSXAttribute extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXAttribute;