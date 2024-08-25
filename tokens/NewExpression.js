module.exports = function(ctx,stack){
    let desc = stack.callee.type();
    desc = stack.compiler.callUtils("getOriginType",desc)
    if( desc !== stack.module && stack.compiler.callUtils("isTypeModule",desc) ){
        ctx.addDepend( desc );
    }
    const node = ctx.createNode( stack );
    node.callee = node.createToken( stack.callee );
    node.arguments = stack.arguments.map( item=> node.createToken(item) );
    return node;
}