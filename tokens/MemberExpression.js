const Constant = require("../core/Constant");

function createSuperGetterExpressionNode(ctx, object, property){
    const callee = createSuperMemberNode(ctx, object, property, 'get','call');
    return ctx.createCalleeNode( callee, [ctx.createThisNode()]);
}

function createSuperMemberNode(ctx, object, property, ...args ){
    object = ctx.createMemberNode([object, ctx.createMemberNode([ctx.createIdentifierNode( ctx.checkRefsName('Class') ), ctx.createIdentifierNode('key')])]);
    object.computed = true;
    return ctx.createMemberNode([object, 'members', property, ...args]);
}

function addImportReference(ctx, desc, module ){
    if(desc && desc.isStack && desc.imports ){
        const isDecl = desc.isDeclaratorVariable || desc.isDeclaratorFunction;
        const builder = ctx.builder;
        if( isDecl && Array.isArray(desc.imports) ){
             desc.imports.forEach( item=>{
                  if( item.source.isLiteral ){
                       const source = item.getResolveFile();
                       const context = module || ctx.compilation;
                       if( !builder.hasImportReference(context,source) ){
                            builder.addImportReference(context,source, ctx.createToken(item) );
                       }
                  }
             });
        }
   }

}

function MemberExpression(ctx,stack){
    const module = stack.module;
    const description = stack.descriptor();
    const objectType = stack.object.type();
    if( description && description.isModule && objectType && !objectType.isLiteralObjectType && stack.compiler.callUtils("isTypeModule",description) ){
        ctx.addDepend( description );
    }else{
        const objectDesc = stack.object.descriptor();
        if( stack.compiler.callUtils("isTypeModule", objectDesc) ){
            ctx.addDepend( objectDesc );
        }else{
            addImportReference(ctx, objectDesc, module);
            addImportReference(ctx, description, module);
        }
    }

    const strict = ctx.plugin.options.strict;
    if( strict && description && description.isType && description.isAnyType && !stack.optional){
        let isReflect = false
        let hasDynamic = description.isComputeType && description.isPropertyExists();
        if( !hasDynamic && !stack.compiler.callUtils("isLiteralObjectType", objectType ) ){
            isReflect = true;
        }
        if( isReflect ){
            ctx.addDepend( stack.getGlobalTypeById("Reflect") );
            return ctx.createCalleeNode(
                ctx.createMemberNode([ctx.checkRefsName("Reflect"), ctx.createIdentifierNode('get')]),
                [
                    module ? ctx.createIdentifierNode(module.id) : ctx.createLiteralNode(null), 
                    ctx.createToken(stack.object), 
                    stack.computed ? ctx.createToken(stack.property) : ctx.createLiteralNode(stack.property.value(), void 0, stack.property),
                ],
                stack
            );
        }
    }

    const resolveName = ctx.builder.getClassMemberName(description);
    const enablePrivateChain = ctx.plugin.options.enablePrivateChain;
    if(enablePrivateChain && description && description.isMethodDefinition){
        const modifier = stack.compiler.callUtils('getModifierValue', description);
        const refModule = description.module;
        if(modifier==="private" && refModule.children.length > 0){
            let property = resolveName ? ctx.createIdentifierNode(resolveName, stack.property) : ctx.createToken(stack.property);
            return ctx.createMemberNode(
                [ 
                    ctx.createIdentifierNode(module.id), 
                    ctx.createIdentifierNode('prototype'), 
                    property
                ],
                stack
            );
        }
    }

    if( objectType && !objectType.isLiteralObjectType && stack.compiler.callUtils("isClassType", description) ){
        ctx.addDepend( description );
        return ctx.createIdentifierNode( ctx.getModuleReferenceName(description,module), stack );
    }
    
    if( stack.object.isSuperExpression ){
        let property = resolveName ? ctx.createIdentifierNode(resolveName, stack.property) : ctx.createToken(stack.property);
        if( description && description.isMethodGetterDefinition){
            if(property.type === 'Identifier')property = ctx.createLiteralNode(property.value, void 0 , stack.property)
            const args = [ctx.createIdentifierNode(module.id), ctx.createThisNode(), property]
            return ctx.createCalleeNode(
                ctx.createMemberNode([
                    ctx.createIdentifierNode(ctx.checkRefsName('Class')),
                    ctx.createIdentifierNode('callSuperGetter')
                ]),
                args
            );
            //return createSuperGetterExpressionNode(ctx, ctx.createToken(stack.object), property );
        }else if(description && description.isMethodSetterDefinition){
            // if(property.type === 'Identifier')property = ctx.createLiteralNode(property.value, void 0 , stack.property)
            // const args = [ctx.createIdentifierNode(module.id), ctx.createThisNode(), property]
            // return ctx.createCalleeNode(
            //     ctx.createMemberNode([
            //         ctx.createIdentifierNode(ctx.checkRefsName('Class')),
            //         ctx.createIdentifierNode('fetchSuperSetter')
            //     ]),
            //     args
            // );
            //return createSuperMemberNode(ctx, ctx.createToken(stack.object), property ,'set');
        }else{
            return ctx.createMemberNode([ctx.createToken(stack.object), ctx.createIdentifierNode('prototype'), property ]);
        }
  
    }

    
    let propertyNode = resolveName ? ctx.createIdentifierNode(resolveName, stack.property) : ctx.createToken(stack.property);
    if(enablePrivateChain && description && description.isPropertyDefinition && !(description.static || description.module.static) ){
        const modifier = stack.compiler.callUtils('getModifierValue', description);
        if( "private" === modifier ){
            const object = ctx.createMemberNode([
                ctx.createToken(stack.object),
                ctx.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)
            ]);
            object.computed = true;
            return ctx.createMemberNode([
                object, 
                propertyNode
            ]);
        }
    }

    if( description && (!description.isAccessor && description.isMethodDefinition) ){
        if( !ctx.isRawJsx() ){
            const pStack = stack.getParentStack( stack=>!!(stack.jsxElement || stack.isBlockStatement || stack.isCallExpression || stack.isExpressionStatement));
            if( pStack && pStack.jsxElement ){
                return ctx.createCalleeNode(
                    ctx.createMemberNode([ 
                        ctx.createToken(stack.object), 
                        propertyNode,
                        ctx.createIdentifierNode('bind')
                    ]),
                    [ctx.createThisNode()]
                );
            }
        }
    }

    const node = ctx.createNode(stack);
    node.computed = !!stack.computed;
    node.optional = !!stack.optional;
    node.object = node.createToken( stack.object );
    node.property = propertyNode;
    return node;
}

MemberExpression.createSuperGetterExpressionNode = createSuperGetterExpressionNode;
MemberExpression.createSuperMemberNode = createSuperMemberNode;
module.exports = MemberExpression;