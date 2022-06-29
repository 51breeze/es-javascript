module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.quasis = stack.quasis.map( item=>node.createToken(item) );
    node.expressions = stack.expressions.map( item=>node.createToken(item) );
    return node;
}