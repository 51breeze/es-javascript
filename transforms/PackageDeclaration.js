module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.body = stack.body.map( item=>node.createToken(item) );
    return node;
}