module.exports = function(ctx, stack){
    const node = ctx.createNode(stack);
    node.name = node.createToken(stack.name);
    return node;
}