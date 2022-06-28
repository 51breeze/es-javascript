module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.expression = node.createNode( stack );
    return node;
 };