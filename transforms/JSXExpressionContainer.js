const JSXElement = require('./JSXElement');
module.exports = function(ctx, stack){
    if( stack.parentStack.isSlot && stack.expression && !stack.expression.isJSXElement){
        const name = stack.parentStack.openingElement.name.value();
        return JSXElement.createElementNode(ctx, 
            ctx.createLiteralNode('span'), 
            ctx.createObjectNode([
                ctx.createPropertyNode(
                    ctx.createIdentifier('slot'),
                    ctx.createLiteralNode(name)
                )
            ]), 
            ctx.createToken( stack.expression )
        );
    }
    return ctx.createToken( stack.expression );
}