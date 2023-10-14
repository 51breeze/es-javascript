module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.properties = stack.properties.map( item=> node.createToken(item) );
    return node;
}