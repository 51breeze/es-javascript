module.exports = function(ctx,stack){
   var name = stack.value();
   if( stack.parentStack.parentStack.isJSXAttribute ){
      if( name.includes('-') ){
         return ctx.createLiteralNode(name, void 0, stack);
      }
   }
   const node = ctx.createNode( stack , 'Identifier');
   node.value = name;
   node.raw = name;
   return node;
}