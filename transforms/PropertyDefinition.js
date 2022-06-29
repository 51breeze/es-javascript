module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.declarations = (stack.declarations || []).map( item=>node.createToken(item) );
    node.modifier = stack.compiler.callUtils('getModifierValue', stack);
    node.static = !!stack.static;
    node.kind = stack.kind;
    node.key =  node.declarations[0].id;
    node.init = node.declarations[0].init;
    return node;
}