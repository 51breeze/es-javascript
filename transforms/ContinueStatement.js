module.exports = function(ctx,stack){
    const node = ctx.createToken( stack );
    node.label = node.createToken( stack.label );
    return node;
};