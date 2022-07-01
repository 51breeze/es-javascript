module.exports = function(ctx,stack){
    const node = ctx.createNode( stack );
    node.body = [];
    stack.body.forEach( item=>{
        if( item.isClassDeclaration || item.isDeclaratorDeclaration || item.isEnumDeclaration || item.isInterfaceDeclaration ){
            node.body.push( node.createToken(item) );
        }
    });
    return node;
}