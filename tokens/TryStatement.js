module.exports = function(ctx,stack){
   const node = ctx.createNode(stack);
   node.block = node.createToken(stack.block);
   node.param = node.createToken(stack.param);
   node.handler = node.createToken(stack.handler);
   node.finalizer = node.createToken(stack.finalizer);
   return node;
}