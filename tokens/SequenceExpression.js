module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.expressions = stack.expressions.map( item=>node.createToken(item) );
    return node;
}