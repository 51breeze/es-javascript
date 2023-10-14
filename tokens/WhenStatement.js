module.exports = function(ctx,stack){
    ctx = ctx.createNode(stack);
    const name = stack.condition.value();
    const args = stack.condition.arguments.map( (item,index)=>{
        const value = item.value(); 
        const key = item.isAssignmentExpression ? item.left.value() : index;
        return {key,value,stack:item};
    });
    const expectRaw = args.find( item=>String(item.key).toLowerCase() ==='expect' );
    const expect = expectRaw ? String(expectRaw.value) === 'true' : true;
    let result = false;
    switch( name ){
        case 'Runtime' :
            result = ctx.builder.isRuntime( args[0].value ) === expect;
        break;
        case 'Syntax' :
            result = ctx.builder.isSyntax( args[0].value ) === expect;
        break;
        case 'Env' :
            result = ctx.builder.isEnv( args[0].value, args[1] && args[1].value ) === expect;
        break;
        case 'Version' :
            const nameRaw = args.find( item=>String(item.key).toLowerCase() ==='name' );
            const items = args.filter( item=>expectRaw!==item && nameRaw !==item && item.value ).map( item=> item.value );
            if( nameRaw )items.push( nameArg.value );
            result = ctx.builder.isVersion.apply(ctx.builder, items ) === expect;
        break;
        default:
    }
    const node = ctx.createToken( result ? stack.consequent : stack.alternate );
    node && (node.isWhenStatement = true);
    return node;
}