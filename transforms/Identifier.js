module.exports = function(ctx,stack){
     const desc = stack.description();
     const module = stack.module;
     const builder = ctx.builder;
     if( desc && (desc.isPropertyDefinition || desc.isMethodDefinition) ){
          const ownerModule = desc.module;
          const isStatic = !!(desc.static || ownerModule.static);
          const object = isStatic ? ctx.createIdentifier(ownerModule.id) : ctx.createThisNode();
          const property = ctx.createIdentifier(this.stack.value(), this.stack);
          return ctx.createMemberNode([object, property]);
     }
     if( module && this.compiler.callUtils("isClassType", desc) ){
          builder.addDepend( desc );
          return ctx.createIdentifier(builder.getModuleReferenceName(desc, module), this.stack);
     }
     return ctx.createIdentifier(this.stack.value(), this.stack);
};