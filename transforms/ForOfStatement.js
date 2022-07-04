module.exports = function(ctx,stack){
    const type = stack.compiler.callUtils('getOriginType',stack.right.type());
    if( stack.compiler.callUtils('isLocalModule', type) || stack.right.type().isAnyType ){
        const node = ctx.createNode(stack,'ForStatement');
        const obj = ctx.checkRefsName('_i');
        const res = ctx.checkRefsName('_v');
        const init = ctx.createToken(stack.left);
        const object = init.createAssignmentNode( init.createIdentifierNode( obj ), init.createCalleeNode(
            init.createMemberNode([ctx.checkRefsName('System'),'getIterator']),
            [
                init.createToken(stack.right)
            ]
        ));
        init.declarations.push( init.createIdentifierNode( res ) );
        init.declarations.push( object );
        const condition = ctx.createChunkNode(`${obj} && (${res}=${obj}.next()) && !${res}.done`, false);
        node.init = init;
        node.condition = condition;
        node.update = null;
        node.body  = node.createToken(stack.body);
        const block = node.body; 
        const assignment = block.createStatementNode(
            block.createAssignmentNode(
                block.createIdentifierNode( init.declarations[0].id.value ),
                block.createMemberNode([
                    block.createIdentifierNode( res ),
                    block.createIdentifierNode('value')
                ])
            )
        );
        block.body.splice(0,0,assignment);
        return node;
    }
    const node = ctx.createNode(stack);
    node.left  = node.createToken(stack.left);
    node.right = node.createToken(stack.right);
    node.body  = node.createToken(stack.body);
    return node;
}