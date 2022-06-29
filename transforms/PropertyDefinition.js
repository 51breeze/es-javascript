module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.annotations = (stack.annotations || []).map( item=>node.createToken(item) );
    node.modifier = stack.complier.callUtils('getModifierValue', stack);
    node.static = !!stack.static;
    node.kind = stack.kind;
    node.key =  node.annotations[0].id;
    return node;
}