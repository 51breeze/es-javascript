const Constant = require("../core/Constant");
module.exports = function(ctx,stack){
     const desc = stack.description();
     const module = stack.module;
     const builder = ctx.builder;
     if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) ){
          const ownerModule = desc.module;
          const isStatic = !!(desc.static || ownerModule.static);
          const property = ctx.createIdentifierNode(stack.value(), stack);
          const modifier = stack.compiler.callUtils('getModifierValue', desc);
          var object = isStatic ? ctx.createIdentifierNode(ownerModule.id) : ctx.createThisNode();
          if( desc.isPropertyDefinition && modifier ==="private" && !isStatic ){
               object = ctx.createMemberNode([
                    object, 
                    ctx.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)
               ]);
               object.computed = true;
               return ctx.createMemberNode([object, property]);
          }else{
               return ctx.createMemberNode([object, property]);
          }
     }
     if( module && stack.compiler.callUtils("isClassType", desc) ){
          builder.addDepend( desc );
          return ctx.createIdentifierNode(builder.getModuleReferenceName(desc, module), stack);
     }
     return ctx.createIdentifierNode(stack.value(), stack);
};