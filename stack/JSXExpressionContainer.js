const Syntax = require("../core/Syntax");
class JSXExpressionContainer extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXExpressionContainer;