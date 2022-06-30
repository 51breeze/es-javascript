module.exports = function(ctx,stack){
   const operator = stack.node.operator;
   const prefix   = stack.node.prefix;
   if( operator==='delete' && stack.argument.isMemberExpression ){
      const desc = stack.argument.description();
      if( desc && desc.isAnyType ){
         const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
         if( !hasDynamic && !stack.compiler.callUtils("isLiteralObjectType", stack.argument.object.type() ) ){
            ctx.addDepend( stack.getGlobalTypeById("Reflect") );
            const property =  stack.argument.computed ? ctx.createToken(stack.argument.property) : 
                              ctx.createLiteralNode(stack.argument.property.value(), void 0, stack.argument.property);
            return ctx.createCalleeNode(
               ctx.createMemberNode(['Reflect','deleteProperty']),
               [
                  ctx.createToken(stack.argument.object),
                  property
               ]
            );
         }
      }
   }
   const node = ctx.createNode(stack);
   node.argument = node.createToken(stack.argument);
   node.operator = operator;
   node.prefix = prefix;
   return node;
}