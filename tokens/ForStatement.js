module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.init  = node.createToken(stack.init);
    node.condition = node.createToken(stack.condition);
    node.update  = node.createToken(stack.update);
    node.body  = node.createToken(stack.body);
    return node;
}