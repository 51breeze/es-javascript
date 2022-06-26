const Token = require("../core/Token");
class ExpressionStatement extends Token{
    constructor(stack){
        super(stack);
        this.expression = this.createToken(stack.expression);
    }
}
module.exports = ExpressionStatement;