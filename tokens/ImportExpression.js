module.exports = function(ctx,stack){
   const node = ctx.createNode(stack);
   node.source  = node.createToken(stack.source);
   return node;
}