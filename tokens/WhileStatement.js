module.exports = function(ctx,stack){
     const node = ctx.createNode(stack);
     node.condition = node.createToken(stack.condition);
     node.body = node.createToken(stack.body);
     return node;
}