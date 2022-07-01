module.exports = function(ctx,stack){
    const isMember = stack.callee.isMemberExpression;
    const desc = stack.callee.description();
    const module = stack.module;

    if( isMember && desc && desc.isType && desc.isAnyType  ){
        ctx.addDepend( stack.getGlobalTypeById("Reflect") );
        const propValue = stack.callee.property.value();
        const property = ctx.createLiteralNode( propValue, void 0, stack.callee.property);
        return ctx.createCalleeNode(
            ctx.createMemberNode([ctx.checkRefsName("Reflect"),'call']),
            [
                ctx.createIdentifierNode(module.id),
                ctx.createToken(stack.callee.object),
                property,
                ctx.createArrayNode( stack.arguments.map( item=>ctx.createToken(item) ) )
            ],
            stack
        );
    }

    if( stack.callee.isSuperExpression || isMember && stack.callee.object.isSuperExpression ){
        return ctx.createCalleeNode(
            ctx.createMemberNode(
                [
                    ctx.createToken(stack.callee),
                    ctx.createIdentifierNode('call'),
                ]
            ),
            [ctx.createThisNode()].concat( stack.arguments.map( item=>ctx.createToken(item) ) ),
            stack
        );
    }


    if( desc && desc.isMethodDefinition ){
        const modifier = stack.compiler.callUtils('getModifierValue', desc);
        const refModule = desc.module;
        if( modifier==="private" && refModule.children.length > 0){
            return ctx.createCalleeNode(
                ctx.createMemberNode(
                    [
                        ctx.createToken(stack.callee),
                        ctx.createIdentifierNode('call'),
                    ]
                ),
                [ isMember ? ctx.createToken(stack.callee.object) : ctx.createThisNode() ].concat( stack.arguments.map( item=>ctx.createToken(item) ) ),
                stack
            );
        }
    }

    if( ctx.compiler.callUtils("isTypeModule", desc) ){
        ctx.addDepend( desc );
    }

    const node = ctx.createNode( stack );
    node.callee = node.createToken( stack.callee );
    node.arguments = stack.arguments.map( item=>node.createToken(item) );
    return node;
}