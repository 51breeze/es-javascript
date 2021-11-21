const Syntax = require("../core/Syntax");
class JSXExpressionContainer extends Syntax{
    emitter(level){
        return this.make( this.stack.expression );
    }
}

module.exports = JSXExpressionContainer;