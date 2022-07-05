module.exports = function(ctx,stack){
   const node = ctx.createNode( stack , 'Identifier');
   node.value = stack.value();
   node.raw = node.value;
   return node;
}