module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    const operator = stack.node.operator;
    const prefix = stack.node.prefix;
    const isMember = stack.argument.isMemberExpression;
    if( isMember ){
        const desc = stack.argument.description();
        const module = stack.module;
        const scopeId = module ? module.id : 'null';
        let isReflect = false;
        if( stack.argument.computed ){
            const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
            if( !hasDynamic && !node.compiler.callUtils("isLiteralObjectType",stack.argument.object.type() ) ){
                isReflect = true;
            }
        }else if( desc && desc.isAnyType ){
            isReflect = !node.compiler.callUtils("isLiteralObjectType", stack.argument.object.type() )
        }

        if(isReflect){
            const method = operator ==='++' ? 'incre' : 'decre';
            node.addDepend( stack.getGlobalTypeById("Reflect") );
            const callee = node.createMemberNode([
                node.checkRefsName("Reflect"),
                node.createIdentifierNode(method)
            ]);
            return node.createCalleeNode( callee, [
                node.createIdentifierNode(scopeId),
                node.createToken(stack.argument.object), 
                node.createLiteralNode(stack.argument.property.value()),
                node.createLiteralNode( !!prefix ),
            ], stack);
        }
    }
    
    node.argument = node.createToken(stack.argument);
    node.operator = operator;
    node.prefix = prefix;
    return node;
}