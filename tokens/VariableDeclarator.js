module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.inFor = stack.flag;
    if( stack.id.isIdentifier){
        node.id = node.createIdentifierNode(stack.id.value(),stack.id);
    }else{
        node.id = node.createToken(stack.id);
    }
    node.init = node.createToken(stack.init);
    return node;
}