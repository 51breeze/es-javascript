module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    const parent = stack.module.inherit;
    node.value = ctx.getModuleReferenceName(parent);
    node.raw = node.value;
    return node;
}