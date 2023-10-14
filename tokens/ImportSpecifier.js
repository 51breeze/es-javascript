module.exports = function(ctx, stack){
   const node = ctx.createNode(stack);
   node.imported  = node.createToken(stack.imported);
   node.local = stack.local ?  node.createToken(stack.local) : node.createIdentifierNode(stack.value(), stack);
   return node;
}