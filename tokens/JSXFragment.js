module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.children = stack.children.map( child=>node.createToken(child) );
    return node;
}