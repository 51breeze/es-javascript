module.exports = function(ctx,stack){
   const node = ctx.createNode(stack);
   node.body = [];
   stack.body.forEach( child=>{
      const token = node.createToken( child );
      if( token ){
         node.body.push( token );
      }
   });
   return node;
};