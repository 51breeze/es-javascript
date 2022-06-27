const Token = require("../core/Token");
class LabeledStatement extends Token{
    
    createChildren(stack){
        this.label = this.createToken( stack.label );
        this.body = this.createToken( stack.body );
    }

    make( gen ){
        gen.newLine();
        this.label.make( gen );
        gen.withColon();
        this.body.make( gen );
    }
}

module.exports = LabeledStatement;