module.exports = function(ctx,stack){
   const node = ctx.createNode(stack);
   node.body = [];
   stack.body.forEach( child=>{
      node.body.push( node.createToken( child ) );
   });
   return node;
};