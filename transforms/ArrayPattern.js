module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.elements = stack.elements.map( item=>node.createToken(item) );
    return node;
}