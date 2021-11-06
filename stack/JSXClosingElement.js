const Syntax = require("../core/Syntax");
class JSXClosingElement extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXClosingElement;