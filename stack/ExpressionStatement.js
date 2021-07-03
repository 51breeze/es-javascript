const Syntax = require("../core/Syntax");
class ExpressionStatement extends Syntax{
    emitter(){
        const value = this.make(this.stack.expression);
        if( this.stack.expression.node.type ==="AwaitExpression" ){
            return value;
        }
        return this.semicolon( value );
    }
}
module.exports = ExpressionStatement;