//const JSXTransform = require("../core/JSXTransform");
module.exports = function(ctx, stack){
    // if( stack.parentStack.isSlot && stack.expression && !stack.expression.isJSXElement){
    //     const name = stack.parentStack.openingElement.name.value();
    //     const node = new JSXTransform(stack, ctx);
    //     return node.createElementNode(
    //         ctx,
    //         ctx.createLiteralNode('span'),
    //         ctx.createObjectNode([
    //             ctx.createPropertyNode(
    //                 ctx.createIdentifierNode('slot'),
    //                 ctx.createLiteralNode(name)
    //             )
    //         ]), 
    //         ctx.createToken( stack.expression )
    //     );
    // }
   
    return ctx.createToken( stack.expression );
}