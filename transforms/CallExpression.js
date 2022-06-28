module.exports = function(ctx,stack){
    const isMember = stack.callee.isMemberExpression;
    const desc = stack.callee.description();
    const module = stack.module;

    if( isMember && desc && desc.isType && desc.isAnyType  ){
        ctx.addDepend( stack.getGlobalTypeById("Reflect") );
        const propValue = stack.callee.property.value();
        const property = ctx.createLiteralNode( propValue, `"${propValue}"`, stack.callee.property);
        return ctx.createCalleeNode(
            ctx.createMemberNode([ctx.checkRefsName("Reflect"),'call']),
            [
                module.id,
                ctx.createToken(stack.callee.object),
                property,
                ctx.createArrayNode( this.arguments.map( item=>ctx.createToken(item) ) )
            ],
            stack
        );
    }

    if( stack.callee.isSuperExpression || isMember && stack.callee.object.isSuperExpression ){
        return ctx.createCalleeNode(
            ctx.createMemberNode(
                [
                    ctx.createToken(stack.callee),
                    'call',
                    ctx.createThisNode()
                ]
            ),
            this.arguments.map( item=>ctx.createToken(item) ),
            stack
        );
    }


    if( desc && desc.isMethodDefinition ){
        const modifier = stack.callUtils('getModifierValue', desc);
        const refModule = desc.module;
        if( modifier==="private" && refModule.children.length > 0){
            return ctx.createCalleeNode(
                ctx.createMemberNode(
                    [
                        ctx.createToken(stack.callee),
                        'call',
                        isMember ? ctx.createToken(callee.object) : ctx.createThisNode()
                    ]
                ),
                stack.arguments.map( item=>ctx.createToken(item) ),
                stack
            );
        }
    }

    if( ctx.compiler.callUtils("isTypeModule", desc) ){
        ctx.addDepend( desc );
    }

    const node = this.createNode( stack );
    node.callee = node.createToken( stack.callee );
    node.arguments = stack.arguments.map( item=>node.createToken(item) );
    return node;
}