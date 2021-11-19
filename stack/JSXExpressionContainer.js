const Syntax = require("../core/Syntax");
class JSXExpressionContainer extends Syntax{
    emitter(level){
        let indent = !this.stack.parentStack.isJSXAttribute && level > 0 ? "\t".repeat( level ) : '';
        return indent+this.make( this.stack.expression );
    }
}

module.exports = JSXExpressionContainer;