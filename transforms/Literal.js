module.exports = function(ctx,stack){
     const node = ctx.createLiteralNode(stack.raw(), stack);
     return node;
 }