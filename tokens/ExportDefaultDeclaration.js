module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.declaration = node.createToken(stack.declaration);
    return node;
 }