const Token = require("../core/Token");
class ExpressionStatement extends Token{
    createChildren( stack ){
        this.expression = this.createToken(stack.expression);
    }
    make( gen ){
        gen.newLine();
        this.expression.make( gen );
        gen.withSemicolon();
    }
}
module.exports = ExpressionStatement;