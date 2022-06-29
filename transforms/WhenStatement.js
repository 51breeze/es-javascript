module.exports = function(ctx,stack){
    const name = stack.condition.value();
    const args = stack.condition.arguments.map( (item,index)=>{
        const value = item.value(); 
        const key = item.isAssignmentExpression ? item.left.value() : index;
        return {key,value,stack:item};
    });
    const expect = args.length > 1 && args[1].key==='expect' ? !!args[1].value : true;
    let result = false;
    switch( name ){
        case 'Runtime' :
            result = this.isRuntime( args[0].value ) === expect;
        break;
        case 'Syntax' :
            result = this.isSyntax( args[0].value ) === expect;
        break;
        case 'Env' :
            result = this.isEnv( args[0].value ) === expect;
        break;
        default:
    }
    const node = ctx.createToken( result ? stack.consequent : stack.alternate );
    node.isWhenStatement = true;
    return node;
}