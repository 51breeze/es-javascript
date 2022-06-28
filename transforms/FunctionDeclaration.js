const FunctionExpression = require("./FunctionExpression");
module.exports = function(ctx,stack,type){
    const node = FunctionExpression(ctx,stack,type);
    node.key = node.createToken( stack.key );
    return node;
};