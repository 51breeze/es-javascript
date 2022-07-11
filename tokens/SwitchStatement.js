module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.condition = node.createToken( stack.condition );
    node.cases = stack.cases.map( item=>node.createToken(item) );
    return node;
}