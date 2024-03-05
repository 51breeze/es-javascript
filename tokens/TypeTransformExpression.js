module.exports = function(ctx,stack){
     const node = ctx.createNode(stack);
     //node.expression = node.createToken(stack.referExpression);
     return node.createToken(stack.expression);
}