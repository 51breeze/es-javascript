module.exports = function(ctx,stack,type){
   const classModule = stack.getModuleById( stack.specifiers.value() );
   if( ctx.isActiveForModule(classModule) ){
      const name = stack.alias ? stack.alias.value() : classModule.id;
      const source = ctx.builder.getModuleImportSource( classModule, stack.compilation.file );
      return ctx.createImportNode( source, [
         ctx.createImportSpecifierNode(null, name)
      ]);
   }
   return null;
}