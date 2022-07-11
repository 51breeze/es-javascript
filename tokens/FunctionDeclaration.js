const FunctionExpression = require("./FunctionExpression");
module.exports = function(ctx,stack,type){
    const node = FunctionExpression(ctx,stack,type);
    if( stack.isConstructor ){
        node.key = node.createIdentifierNode(stack.module.id, stack.key);
    }else{
        node.key = node.createIdentifierNode(stack.key.value(), stack.key);
    }
    return node;
};