module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.left  = node.createToken( stack.left );
    node.right = node.createToken( stack.right );
    return node;
}