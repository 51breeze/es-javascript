const Syntax = require("../core/Syntax");
class ExpressionStatement extends Syntax{
    emiter( syntax ){
        const value = this.stack.expression.emiter(syntax);
        if( this.stack.expression.node.type ==="AwaitExpression" ){
            return value;
        }
        return this.semicolon( value );
    }
}
module.exports = ExpressionStatement;