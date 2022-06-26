const Syntax = require("../core/Syntax");
class JSXExpressionContainer extends Syntax{
    emitter(level){
        if( this.stack.parentStack.isSlot && this.stack.expression && !this.stack.expression.isJSXElement){
            const result = this.make( this.stack.expression );
            const handle = this.getJsxCreateElementHandle();
            const name = this.stack.parentStack.openingElement.name.value();
            return `${handle}('span',{"slot":'${name}'},${result})`;
        }
        return this.make( this.stack.expression );
    }
}

module.exports = JSXExpressionContainer;