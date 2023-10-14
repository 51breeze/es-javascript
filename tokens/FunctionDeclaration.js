const FunctionExpression = require("./FunctionExpression");
module.exports = function(ctx,stack,type){
    const node = FunctionExpression(ctx,stack,type);
    if( stack.isConstructor ){
        node.key = node.createIdentifierNode(stack.module.id, stack.key);
    }else{
        let name = stack.key.value();
        if( stack.isMethodDefinition ){
            name = ctx.builder.getClassMemberName(stack, name);
        }
        node.key = node.createIdentifierNode(name, stack.key);
    }
    return node;
};