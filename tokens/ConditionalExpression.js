module.exports = function(ctx,stack){
     const node = ctx.createNode(stack);
     node.test = node.createToken( stack.test );
     node.consequent = node.createToken(stack.consequent);
     node.alternate = node.createToken(stack.alternate);
     return node;
}