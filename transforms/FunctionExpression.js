module.exports = function(ctx,stack,type){
   const node = ctx.createNode(stack,type);
   node.async = stack.async ? node.createNode(stack.node.async) : null;
   node.params = stack.params.map( item=>node.createNode(item) );
   node.body = node.createNode( stack.body );
   return node;
};