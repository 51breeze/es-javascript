module.exports = function(ctx,stack){
     const operator = stack.node.operator;
     if( operator ==="is" || operator==="instanceof" ){
          const type = stack.right.type();
          ctx.addDepend( type );
          if( operator === "is" && !stack.compiler.callUtils("isGloableModule", type) ){
               ctx.addDepend( stack.getGlobalTypeById('System') );
               return ctx.createCalleeNode(
                    ctx.createMemberNode([ctx.checkRefsName('System'),'is']),
                    [
                         ctx.createToken(stack.left),
                         ctx.createToken(stack.right)
                    ],
                    stack
               );
          }
     }
     const node = ctx.createNode(stack);
     node.left  = node.createToken(stack.left);
     node.right = node.createToken(stack.right);
     node.operator = stack.node.operator;
     return node;
}