module.exports = function(ctx,stack,type){
   const node = ctx.createNode(stack,type);
   node.async = stack.async ? true : false;
   node.params = stack.params.map( item=>node.createToken(item) );
   node.body = node.createToken( stack.body );
   return node;
};