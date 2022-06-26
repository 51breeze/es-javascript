const Syntax = require("../core/Syntax");
class WhenStatement extends Syntax{
    emitter(){
        const name = this.stack.condition.value();
        if( !this.stack.condition.isCallExpression ){
            this.condition.error( `'when' compiler directive condition statement must is callable expression` )
        }
        const args = this.stack.condition.arguments.map( (item,index)=>{
            const value = item.value(); 
            const key = item.isAssignmentExpression ? item.left.value() : index;
            return {key,value,stack:item};
        });
        if( args.length < 1  ){
            this.stack.condition.error( `'${name}' compiler directive params missing.` );
        }
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
                this.stack.condition.error( `'${name}' compiler directive is not supported.` )
        }
        if( result ){
            return this.make(this.stack.consequent);
        }
        return this.make(this.stack.alternate);
    }
}

module.exports = WhenStatement;