module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.name = node.createToken(stack.name);
    node.namespace = node.createToken(stack.namespace);
    const xmlns = stack.getXmlNamespace();
    if( xmlns ){
        node.value = xmlns.value.value();
    }else {
        const ops = stack.compiler.options;
        node.value = ops.jsx.xmlns.default[ stack.namespace.value() ] || null;
    }
    node.value = node.name.value;
    node.raw   = node.value;
    return node;
}