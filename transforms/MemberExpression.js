const Constant = require("../core/Constant");

function createSuperGetterExpressionNode(ctx, object, property){
    const callee = createSuperMemberNode(ctx, object, property, 'get','call');
    return ctx.createCalleeNode( callee, [ctx.createThisNode()]);
}

function createSuperMemberNode(ctx, object, property, ...args ){
    object = ctx.createMemberNode([object, ctx.createMemberNode([ctx.checkRefsName('Class'),'key']) ]);
    object.computed = true;
    return ctx.createMemberNode([object, 'members', property, ...args]);
}

function MemberExpression(ctx,stack){
   
    const module = this.module;
    const description = stack.description();
    let isStatic = false;
    if( description && description.isModule && stack.compiler.callUtils("isTypeModule",description) ){
        ctx.addDepend( description );
    }else if( stack.compiler.callUtils("isTypeModule", stack.object.description()) ){
        isStatic = true;
        ctx.addDepend( stack.object.description() );
    }

    if( description && description.isType && description.isAnyType ){
        let isReflect = false
        const hasDynamic = description.isComputeType && description.isPropertyExists();
        if( !hasDynamic && !stack.compiler.callUtils("isLiteralObjectType", stack.object.type() ) ){
            isReflect = true;
        }
        if( isReflect ){
            this.addDepend( stack.getGlobalTypeById("Reflect") );
            return ctx.createCalleeNode(
                ctx.createMemberNode([ctx.checkRefsName("Reflect"),'get']),
                [ctx.createIdentifierNode(module.id), ctx.createToken(stack.object), ctx.createToken(stack.property)],
                stack
            );
        }
    }

    if(description && description.isMethodDefinition){
        const modifier = stack.compiler.callUtils('getModifierValue', description);
        const refModule = description.module;
        if(modifier==="private" && refModule.children.length > 0){
            return this.createMemberNode(
                [module.id, 'prototype', ctx.createToken(stack.property)],
                stack
            );
        }
    }

    if( stack.compiler.callUtils("isClassType", description) ){
        ctx.addDepend( description );
        return ctx.createIdentifierNode( ctx.getModuleReferenceName(description,module), stack );
    }
    
    if( stack.object.isSuperExpression ){
        if( description && description.isMethodGetterDefinition ){
            return createSuperGetterExpressionNode(ctx,stack.object, stack.property);
        }else if(description && description.isMethodSetterDefinition ){
            return createSuperMemberNode(ctx,stack.object,stack.property,'set');
        }else{
            return ctx.createMemberNode([stack.object,'prototype',stack.property]);
        }
    }

    if(description && description.isPropertyDefinition && !isStatic && description.modifier && description.modifier.value() === "private"){
        const modifier = stack.compiler.callUtils('getModifierValue', description);
        if( "private" ===modifier ){
            const object = ctx.createMemberNode([stack.object,ctx.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)]);
            object.computed = true;
            return ctx.createMemberNode([object, ctx.createToken(stack.property)]);
        }
    }

    if( description && (!description.isAccessor && description.isMethodDefinition) ){
        const pStack = stack.getParentStack( stack=>!!(stack.jsxElement || stack.isBlockStatement || stack.isCallExpression || stack.isExpressionStatement));
        if( pStack && pStack.jsxElement ){
            return ctx.createCalleeNode(
                ctx.createMemberNode([stack.object, stack.property, 'bind']),
                [ctx.createThisNode()]
            );
        }
    }

    const node = ctx.createNode(stack);
    node.object = node.createToken( stack.object );
    node.property = node.createToken( stack.property );
    return node;
}

MemberExpression.createSuperGetterExpressionNode = createSuperGetterExpressionNode;
MemberExpression.createSuperMemberNode = createSuperMemberNode;
module.exports = MemberExpression;