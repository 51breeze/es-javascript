module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.label = node.createIdentifierNode(stack.label.value(), stack.label);
    return node;
}