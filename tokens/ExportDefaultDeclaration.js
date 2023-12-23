module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.declaration = node.createToken(stack.declaration);
    if(!node.declaration)return null;
    return node;
 }