module.exports = function(ctx, stack){
   const node = ctx.createNode(stack);
   node.local = stack.local ?  node.createToken(stack.local) : node.createIdentifierNode(stack.value(), stack);
   return node;
}