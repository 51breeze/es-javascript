module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.argument = node.createToken( stack.argument );
    return node;
 }