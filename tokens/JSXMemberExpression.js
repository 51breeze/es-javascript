module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.object = node.createToken(stack.object);
    node.property = node.createToken(stack.property);
    return node;
 }