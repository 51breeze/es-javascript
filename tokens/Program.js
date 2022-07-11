module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.body = [];
    node.afterBody = [];
    stack.body.forEach( item=>{
        if( stack.isJSXProgram || item.isClassDeclaration || item.isDeclaratorDeclaration || item.isEnumDeclaration || item.isInterfaceDeclaration || item.isPackageDeclaration ){
            node.body.push( node.createToken(item) );
        }
    });
    if( stack.externals.length > 0 ){
        const parenthes = ctx.createNode('ParenthesizedExpression');
        parenthes.expression = parenthes.createCalleeNode(parenthes.createFunctionNode((ctx)=>{
            stack.externals.forEach( item=>{
                ctx.body.push( ctx.createToken(item) );
            });
        }));
        const external = ctx.createStatementNode( parenthes );
        external.comment = '/*externals code*/';
        node.body.push( external );
    }
    node.afterBody.forEach( item=>{
        node.body.push( item );
    });
    delete node.afterBody;
    return node;
}