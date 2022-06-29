module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.inFor = stack.flag;
    node.id = node.createIdentifierNode(stack.id.value(),stack.id);
    node.init = node.createToken(stack.init);
    return node;
}