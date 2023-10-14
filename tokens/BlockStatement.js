module.exports = function(ctx,stack){
   const node = ctx.createNode(stack);
   node.body = [];
   if( !stack.parentStack.isBlockStatement ){
      ctx.body = node;
   }
   for(let child of stack.body){
      const token = node.createToken( child );
      if( token ){
         node.body.push( token );
         if( child.isWhenStatement ){
            const express = token.type ==='BlockStatement' ? token.body : [token];
            if( Array.isArray(express) ){
               const last = express[ express.length-1 ];
               if( last && last.type ==="ReturnStatement"){
                  return node;
               }
            }
         }
      }
   };
   return node;
};