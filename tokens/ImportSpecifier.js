module.exports = function(ctx, stack){
   const node = ctx.createNode(stack);
   node.imported  = node.createToken(stack.imported);
   node.local  = node.createToken(stack.local);
   return node;
}