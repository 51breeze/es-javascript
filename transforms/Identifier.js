module.exports = function(ctx,stack){
     const desc = stack.description();
     const module = stack.module;
     const builder = ctx.builder;
     const pType = stack.parentStack && stack.parentStack.toString();
     if( pType !=='MemberExpression' || stack.parentStack.object === stack ){
          if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) ){
               const ownerModule = desc.module;
               const isStatic = !!(desc.static || ownerModule.static);
               const object = isStatic ? ctx.createIdentifierNode(ownerModule.id) : ctx.createThisNode();
               const property = ctx.createIdentifierNode(stack.value(), stack);
               return ctx.createMemberNode([object, property]);
          }
     }
     if( module && stack.compiler.callUtils("isClassType", desc) ){
          builder.addDepend( desc );
          return ctx.createIdentifierNode(builder.getModuleReferenceName(desc, module), stack);
     }
     return ctx.createIdentifierNode(stack.value(), stack);
};