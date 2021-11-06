const Syntax = require("../core/Syntax");
class JSXOpeningElement extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXOpeningElement;