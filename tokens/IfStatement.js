const Token = require("../core/Token");
class IfStatement extends Token{

    createChildren( stack ){
        this.condition = this.createToken(stack.condition);
        this.consequent = this.createToken(stack.consequent);
        this.alternate = this.createToken(stack.alternate);
    }

    make( gen ){
        gen.newLine();
        gen.withString('if');
        gen.withParenthesL();
        this.condition.make( gen );
        gen.withParenthesL();
        this.consequent.make( gen );
        if( !this.consequent.stack.isBlockStatement ){
            gen.withSemicolon();
        }
        if( this.alternate ){
            gen.withString('else');
            gen.withSpace();
            this.alternate.make( gen );
            if( !this.alternate.stack.isBlockStatement ){
                gen.withSemicolon();
            }
        }
    }
}

module.exports = IfStatement;