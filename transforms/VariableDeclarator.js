module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.inFor = stack.flag;
    node.init = node.createToken(stack.init);
    node.id = node.createToken(stack.id);
    return node;
}