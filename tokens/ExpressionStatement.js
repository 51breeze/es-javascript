const Token = require("../core/Token");
class ExpressionStatement extends Token{
    createChildren( stack ){
        this.expression = this.createToken(stack.expression);
    }
    make( gen ){
        this.expression.make( gen );
        gen.withSemicolon();
        gen.newLine();
    }
}
module.exports = ExpressionStatement;