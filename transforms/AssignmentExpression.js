module.exports = function(ctx,stack){
    const desc = stack.description();
    const module = stack.module;
    const isMember = stack.left.isMemberExpression;
    var isReflect = false;
    if( isMember ){
        if( stack.left.computed ){
            const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
            if( !hasDynamic && !ctx.compiler.callUtils("isLiteralObjectType", stack.left.object.type() ) ){
                isReflect = true;
            }
        }else if( desc && desc.isAnyType ){
            isReflect = !ctx.compiler.callUtils("isLiteralObjectType", stack.left.object.type() )
        }
    }

    if(isReflect){
        ctx.addDepend( stack.getGlobalTypeById("Reflect") );
        const callee = ctx.createMemberToken([ctx.checkRefsName("Reflect"),'set']);
        return ctx.createCalleeNode( callee, [
            this.createIdentifierNode(module.id),
            this.createToken(stack.left.object), 
            this.createToken(stack.left.property),
            this.createToken(stack.right)
        ], stack);
    }else if(desc && isMember && stack.left.object.isSuperExpression){
        return ctx.createCalleeNode(
            ctx.createMemberNode([
                ctx.createToken(stack.left),
                ctx.createIdentifierNode('call')
            ]),
            [
                ctx.createThisNode(),
                ctx.createToken(stack.right)
            ],
            stack
        );
    }else{
        const node = ctx.createNode( stack );
        node.left = node.createToken( stack.left );
        node.right = node.createToken( stack.right );
        return node;
    }
}