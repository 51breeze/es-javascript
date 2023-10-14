module.exports = function(ctx,stack){
    const node = ctx.createNode(stack, 'Identifier');
    node.value = node.raw = stack.value();
    return node;
};