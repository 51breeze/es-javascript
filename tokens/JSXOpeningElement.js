module.exports = function(ctx,stack){
   
    const node = ctx.createNode(stack);
    node.attributes = stack.attributes.map( attr=>node.createToken( attr ) );
    node.selfClosing = !!stack.selfClosing;
    if( stack.parentStack.isComponent ){
        const desc = stack.parentStack.description();
        if( desc ){
            if( stack.hasNamespaced && desc.isFragment){
                node.name = node.createIdentifierNode(desc.id, stack.name);  
            }else{
                node.name = node.createIdentifierNode( ctx.builder.getModuleReferenceName(desc), stack.name);
            }
        }else{
            node.name = node.createIdentifierNode( stack.name.value(), stack.name);
        }
    }else{
        node.name = node.createLiteralNode( stack.name.value() , void 0,  stack.name);
    }
    return node;
}