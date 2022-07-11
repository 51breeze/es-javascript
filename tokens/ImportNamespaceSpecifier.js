module.exports = function(ctx, stack){
   const node = ctx.createNode(stack);
   node.local  = node.createToken(stack.local);
   return node;
}