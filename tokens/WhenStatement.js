module.exports = function(ctx,stack){
    ctx = ctx.createNode(stack);
    const name = stack.condition.value();
    const args = stack.condition.arguments.map( (item,index)=>{
        let value = null;
        let key = index;
        if(item.isAssignmentExpression){
            key = item.left.value();
            value = item.right.value();
        }else{
            value = item.value(); 
        }
        return {index,key,value,stack:item};
    });
    const expectRaw = args.find( item=>String(item.key).toLowerCase() ==='expect' );
    const expect = expectRaw ? String(expectRaw.value).trim() !== 'false' : true;
    let result = false;
    switch( name ){
        case 'Runtime' :
            result = ctx.builder.isRuntime(args[0].value) === expect;
        break;
        case 'Syntax' :
            result = ctx.builder.isSyntax(args[0].value) === expect;
        break;
        case 'Env' :{
            const name = args.find( item=>String(item.key).toLowerCase() ==='name' ) || args[0];
            const value = args.find( item=>String(item.key).toLowerCase() ==='value' ) || args[1];
            if(name && value){
                result = ctx.builder.isEnv( name.value, value.value ) === expect;
            }else{
                stack.condition.error(`Missing name or value arguments. the '${stack.condition.value()}' annotations.`);
            }
        }
        break;
        case 'Version' :{
            const name = args.find( item=>String(item.key).toLowerCase() ==='name' ) || args[0];
            const version = args.find( item=>String(item.key).toLowerCase() ==='version' ) || args[1];
            const operator = args.find( item=>String(item.key).toLowerCase() ==='operator' ) || args[2];
            if(name && version){
                const args = [name.value, version.value];
                if(operator){
                    args.push(operator.value);
                }
                result = ctx.builder.isVersion.apply(ctx.builder, args) === expect
            }else{
                stack.condition.error(`Missing name or value arguments. the '${stack.condition.value()}' annotations.`);
            }
        }
        break;
        default:
    }
    const node = ctx.createToken( result ? stack.consequent : stack.alternate );
    node && (node.isWhenStatement = true);
    return node;
}