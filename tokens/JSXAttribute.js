module.exports = function(ctx,stack){
    let ns = null;
    if( stack.hasNamespaced ){
        const xmlns = stack.getXmlNamespace();
        if( xmlns ){
            ns = xmlns.value.value();
        }else {
            const nsStack = stack.getNamespaceStack();
            const ops = stack.compiler.options;
            ns = ops.jsx.xmlns.default[ nsStack.namespace.value() ] || ns;
        }
    }

    const node = ctx.createNode( stack );
    node.namespace = ns;
    
    let name = null;
    let value = stack.value ? ctx.createToken( stack.value ) : ctx.createLiteralNode(true);

    if( stack.isMemberProperty ){
        const eleClass = stack.jsxElement.getSubClassDescription();
        const propsDesc = stack.getAttributeDescription( eleClass );
        const resolveName = ctx.builder.getClassMemberName( propsDesc );
        if( resolveName ){
            name = resolveName.includes('-') ? ctx.createLiteralNode(resolveName) : ctx.createIdentifierNode( resolveName );
        }
        const invoke = node.createJSXAttrHookInvokeNode(stack, node, propsDesc);
        if(invoke)value = invoke;
    }

    if( !name ){
        name = ctx.createToken( stack.name );
    }

    if( ns ==="@binding" && stack.value ){
        const desc = stack.value.description();
        let has = false;
        if(desc){
            has =(desc.isPropertyDefinition && !desc.isReadonly) || 
                 (desc.isMethodGetterDefinition && desc.module && desc.module.getMember( desc.key.value(), 'set') );
        }
        if( !has && stack.value.isJSXExpressionContainer ){
            if( stack.value.expression.isMemberExpression ){
                const objectType = ctx.builder.getGlobalModuleById('Object')
                has = objectType && objectType.is( stack.value.expression.object.type() );  
            }
        }
        if( !has ){
            stack.value.error(10000, stack.value.raw());
        } 
    }

    node.name = name;
    node.value = value;
    return node;
}