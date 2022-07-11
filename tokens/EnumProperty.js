module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.key = node.createToken(stack.key);
    node.init = node.createToken(stack.init);
    return node;
}