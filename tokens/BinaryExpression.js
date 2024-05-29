const globals = ['Array', 'Object','RegExp','Number','String','Function']

module.exports = function(ctx,stack){
     let operator = stack.node.operator;
     let node = ctx.createNode(stack);
     let right = node.createToken(stack.right);
     if( operator ==="is" || operator==="instanceof" ){
          
          let type = stack.right.type();
          let origin = !type.isModule ? stack.compiler.callUtils("getOriginType", type) : type;
          ctx.addDepend( origin );
          if(!type.isModule){
               right = ctx.createIdentifierNode(ctx.checkRefsName(ctx.getModuleReferenceName(origin)))
          }

          if( operator === "is" && !(origin && globals.includes(origin.id))){
               ctx.addDepend( stack.getGlobalTypeById('System') );
               return ctx.createCalleeNode(
                    ctx.createMemberNode([ctx.checkRefsName('System'),'is']),
                    [
                         ctx.createToken(stack.left),
                         right
                    ],
                    stack
               );
          }
          operator = 'instanceof';
     }
    
     node.left  = node.createToken(stack.left);
     node.right = right;
     node.operator = operator;
     return node;
}