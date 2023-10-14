module.exports = function(ctx, stack){
   const node = ctx.createNode(stack);
   node.exported = node.createToken(stack.exported);
   node.local = node.createToken(stack.local);
   return node;
}