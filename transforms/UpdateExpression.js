module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    const operator = stack.node.operator;
    const prefix = stack.node.prefix;
    node.argument = node.createToken(stack.argument);
    node.operator = operator;
    node.prefix = prefix;
    return node;
}