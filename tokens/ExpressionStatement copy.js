const Syntax = require("../core/Syntax");
class ExpressionStatement extends Syntax{
    emitter_none(){
        const value = this.make(this.stack.expression);
        return this.semicolon( value );
    }
    emitter(){
        const value = this.make(this.stack.expression);
        if( this.stack.expression.node.type ==="AwaitExpression" ){
            return value;
        }
        return this.semicolon( value );
    }
}
module.exports = ExpressionStatement;