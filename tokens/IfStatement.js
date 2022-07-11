module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.condition  = node.createToken(stack.condition);
    node.consequent = node.createToken(stack.consequent);
    node.alternate  = node.createToken(stack.alternate);
    return node;
}