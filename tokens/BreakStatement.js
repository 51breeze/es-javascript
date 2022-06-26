const Token = require("../core/Token");
class BreakStatement extends Token{
    createChildren(stack){
        this.label = this.createToken(stack.label);
    }
    make(gen){
        gen.withString('break');
        if( this.label ){
            gen.withSpace();
            this.label.make( gen );
        }
    }
}

module.exports = BreakStatement;