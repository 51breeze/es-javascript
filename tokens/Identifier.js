const Constant = require("../core/Constant");
module.exports = function(ctx,stack){
     const desc = stack.parentStack && stack.parentStack.isImportSpecifier ? null : stack.descriptor();
     const module = stack.module;
     const builder = ctx.builder;
     if(desc && desc.isStack && desc.imports ){
          const isDecl = desc.isDeclaratorVariable || desc.isDeclaratorFunction;
          if( isDecl && Array.isArray(desc.imports) ){
               desc.imports.forEach( item=>{
                    if( item.source.isLiteral ){
                         const source = item.getResolveFile() || item.source.value();
                         const context = module || stack.compilation;
                         builder.addImportReference(context,source, ctx.createToken(item) );
                    }
               });
          }
     }

     if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) && !(stack.parentStack.isProperty && stack.parentStack.key === stack) ){
          const enablePrivateChain = ctx.plugin.options.enablePrivateChain;
          const thisComplete = ctx.plugin.options.thisComplete;
          const ownerModule = desc.module;
          const isStatic = !!(desc.static || ownerModule.static);
          const property = ctx.createIdentifierNode(stack.value(), stack);
          const modifier = stack.compiler.callUtils('getModifierValue', desc);
          var object = isStatic ? ctx.createIdentifierNode(ownerModule.id) : ctx.createThisNode();
          if( enablePrivateChain && desc.isPropertyDefinition && modifier ==="private" && !isStatic ){
               object = ctx.createMemberNode([
                    object, 
                    ctx.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)
               ]);
               object.computed = true;
               return ctx.createMemberNode([object, property], stack);
          }else if(thisComplete){
               return ctx.createMemberNode([object, property], stack);
          }
     }

     if( stack.compiler.callUtils("isClassType", desc)){
          builder.addDepend( desc );
          if(!stack.hasLocalDefined()){
               return ctx.createIdentifierNode(builder.getModuleReferenceName(desc, module), stack);
          }
     }
     return ctx.createIdentifierNode(stack.value(), stack);
};