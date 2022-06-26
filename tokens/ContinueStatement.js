const Token = require("../core/Token");
class ContinueStatement extends Token{
    createChildren(stack){
        this.label = this.createToken(stack.label)
    }
    make(gen){
        gen.withString('continue');
        if( this.label ){
            gen.withSpace();
            this.label.make( gen );
        }
    }
}

module.exports = ContinueStatement;