module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.inFor = stack.flag;
    node.kind = stack.kind;
    node.declarations = stack.declarations.map( item=>{
        return node.createToken(item)
    });
    return node;
}