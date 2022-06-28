module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.label = node.createNode(stack.label);
    return node;
}