module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.label = node.createToken( stack.label );
    return node;
};