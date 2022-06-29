module.exports = function(ctx,stack){
    const desc = stack.callee.description();
    if( stack.compiler.callUtils("isTypeModule",desc) ){
        ctx.addDepend( desc );
    }
    const node = ctx.createNode( stack );
    node.callee = node.createToken( stack.callee );
    node.arguments = stack.arguments.map( item=> node.createToken(item) );
    return node;
}