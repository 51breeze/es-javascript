const Syntax = require("../core/Syntax");
class ParenthesizedExpression extends Syntax{
    emiter( syntax ){
        if( this.stack.parentStack.isExpressionStatement ){
            return this.stack.expression.emiter(syntax);
        }
        return `(${this.stack.expression.emiter(syntax)})`;
    }
}

module.exports = ParenthesizedExpression;