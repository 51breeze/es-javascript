const Token = require("../core/Token");
class ParenthesizedExpression extends Token{

    constructor(stack){
        super(stack);
        this.expression = this.createToken(stack.expression)
    }

    emitter(){
        if( this.stack.parentStack.isExpressionStatement ){
            return this.make(this.stack.expression);
        }
        return `(${this.make(this.stack.expression)})`;
    }
}

module.exports = ParenthesizedExpression;