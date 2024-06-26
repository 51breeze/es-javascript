module.exports = function(ctx,stack){
    if( !stack.flag && !stack.parentStack.isPropertyDefinition && !(stack.id.isArrayPattern || stack.id.isObjectPattern) ){
        const pp = stack.parentStack.parentStack;
        if(pp && !(pp.isExportNamedDeclaration || pp.isExportDefaultDeclaration || pp.isExportSpecifier || pp.isForInStatement || pp.isForStatement || pp.isForOfStatement) && !stack.useRefItems.size){
            if(!stack.init)return null;
        }
    }

    const node = ctx.createNode(stack);
    node.inFor = stack.flag;
    if( stack.id.isIdentifier){
        let name = stack.id.value();
        if( stack.parentStack && stack.parentStack.isPropertyDefinition ){
            name = ctx.builder.getClassMemberName(stack.parentStack, name);
        }
        node.id = node.createIdentifierNode(name,stack.id);
    }else{
        node.id = node.createToken(stack.id);
    }
    node.init = node.createToken(stack.init);
    return node;
}