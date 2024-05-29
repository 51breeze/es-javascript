module.exports = function(ctx,stack){
    const desc = stack.left.description();
    const module = stack.module;
    const isMember = stack.left.isMemberExpression;
    var isReflect = false;
    var operator = stack.operator || stack.node.operator;
    if( isMember){
        if( stack.left.computed ){
            let hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
            if(!hasDynamic && desc && (desc.isProperty && desc.computed || desc.isPropertyDefinition && desc.dynamic)){
                hasDynamic = true
            }
            if( !hasDynamic && !ctx.compiler.callUtils("isLiteralObjectType", stack.left.object.type() ) ){
                isReflect = true;
            }
        }else if( desc && desc.isAnyType ){
            isReflect = !ctx.compiler.callUtils("isLiteralObjectType", stack.left.object.type() )
        }
    }

    if(isReflect){
        const strict = ctx.plugin.options.strict;
        if(strict){
            let value =  ctx.createToken(stack.right);
            let scopeId =  module ? ctx.createIdentifierNode(module.id) : ctx.createLiteralNode(null);
            if( operator && operator.charCodeAt(0) !== 61 && operator.charCodeAt(operator.length-1) === 61 ){
                operator = operator.slice(0,-1)
                const callee = ctx.createMemberNode([
                    ctx.checkRefsName("Reflect"),
                    ctx.createIdentifierNode('get')
                ]);
                const left = ctx.createCalleeNode( callee, [
                    scopeId,
                    ctx.createToken(stack.left.object), 
                    ctx.createLiteralNode(stack.left.property.value(), void 0, stack.left.property),
                ], stack);
                const binary = ctx.createNode('BinaryExpression');
                left.parent = binary;
                binary.left = left;
                value.parent = binary;
                binary.right = value;
                binary.operator = operator;
                value = binary;
            }

            ctx.addDepend( stack.getGlobalTypeById("Reflect") );
            const callee = ctx.createMemberNode([
                ctx.checkRefsName("Reflect"),
                ctx.createIdentifierNode('set')
            ]);
            return ctx.createCalleeNode( callee, [
                scopeId,
                ctx.createToken(stack.left.object), 
                ctx.createLiteralNode(stack.left.property.value(), void 0, stack.left.property ),
                value
            ], stack);
        }
        
    }else if(desc && isMember && stack.left.object.isSuperExpression){
        let resolveName = ctx.builder.getClassMemberName(desc);
        let property = resolveName ? ctx.createIdentifierNode(resolveName, stack.left.property) : ctx.createToken(stack.left.property);
        if(property.type === 'Identifier')property = ctx.createLiteralNode(property.value, void 0 , stack.left.property)
        const args = [ctx.createIdentifierNode(module.id), ctx.createThisNode(), property, ctx.createToken(stack.right)]
        return ctx.createCalleeNode(
            ctx.createMemberNode([
                ctx.createIdentifierNode(ctx.checkRefsName('Class')),
                ctx.createIdentifierNode('callSuperSetter')
            ]),
            args
        );
    }

    const node = ctx.createNode( stack );
    node.left = node.createToken( stack.left );
    node.right = node.createToken( stack.right );
    node.operator = operator;
    return node;
    
}