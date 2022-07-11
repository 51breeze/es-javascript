module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.value = stack.value();
    node.raw = stack.raw();
    node.tail = stack.tail;
    return node;
}