module.exports = function(ctx,stack){
    if( stack.parentStack.isExpressionStatement ){
        return ctx.createToken(stack.expression);
    }
    const node = ctx.createNode( stack );
    node.expression = node.createToken(stack.expression) 
    return node;
}