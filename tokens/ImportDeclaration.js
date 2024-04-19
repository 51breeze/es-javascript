module.exports = function(ctx,stack,type){
   const classModule = stack.description();
   if( classModule && ctx.isActiveForModule(classModule) ){
      const compilation = classModule.compilation;
      ctx.builder.buildForModule(compilation, compilation.stack, classModule);
      let name = stack.alias ? stack.alias.value() : classModule.id;
      if( stack.source.isLiteral && stack.specifiers[0]){
         name = stack.specifiers[0].value();
      }
      const source = ctx.builder.getModuleImportSource( classModule, stack.compilation.file );
      if( name !== classModule.id ){
         return ctx.createImportDeclaration( source, [ctx.createImportSpecifierNode(name,classModule.id)], stack);
      }else{
         return ctx.createImportDeclaration( source, [ctx.createImportSpecifierNode(name)], stack);
      }
   }else if( stack.source.isLiteral ){
      const compilation = stack.getResolveCompilation();
      if( compilation ){
         ctx.builder.buildForModule(compilation, compilation.stack);
      }
      const node = ctx.createNode(stack);
      const module = (stack.additional || stack).module;
      let source = compilation ? stack.getResolveFile() : stack.source.value();
      if( source.includes('${__filename}')){
         source = ctx.builder.getModuleImportSource(source, module)
      }
      if( ctx.builder.isNeedImportDependence(source, module) ){
         const specifiers = stack.specifiers.map( item=>node.createToken(item) )
         const result = ctx.builder.getImportAssetsMapping(source, {
            group:'imports',
            stack,
            specifiers,
            context:node,
            module
         });
         let {source:_source} = result;
         if( _source === null ){
            _source = source;
         }
         if( _source ){
            source = ctx.builder.getModuleImportSource(_source, stack.compilation.file , stack.source.value() );
            return ctx.createImportDeclaration(source, specifiers, stack);
         }
      }
   }
   return null;
}