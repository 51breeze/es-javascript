module.exports = function(ctx, stack){
    const node = ctx.createNode( stack );
    node.openingElement = node.createToken( stack.openingElement );
    node.body =  (stack.body || []).map( child=>node.createToken(child) );
}