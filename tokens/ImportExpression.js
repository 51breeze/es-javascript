module.exports = function(ctx,stack){
   const node = ctx.createNode(stack);
   const desc = stack.description();
   if( desc ){
      const source = node.builder.getModuleImportSource(desc, stack.compilation.file, stack.source.value());
      node.source  = node.createLiteralNode(source, void 0, stack.source);
   }else{
      node.source  = node.createToken(stack.source);
   }
   return node;
}