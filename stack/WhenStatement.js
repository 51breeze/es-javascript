const Syntax = require("../core/Syntax");
class WhenStatement extends Syntax{
    emitter(){
        const name = this.stack.condition.value();
        if( !this.stack.condition.isCallExpression ){
            this.condition.error( `'when' compiler directive condition statement must is callable expression` )
        }
        const args = this.stack.condition.arguments.map( item=>item.value() );
        if( args.length < 1  ){
            this.stack.condition.error( `'${name}' compiler directive params missing.` );
        }
        let result = false;
        switch( name ){
            case 'Runtime' :
                result = this.isRuntime(args[0]) 
            break;
            case 'Syntax' :
                result = this.isSyntax(args[0]) 
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