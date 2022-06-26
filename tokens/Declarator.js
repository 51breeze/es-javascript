const Token = require("../core/Token");
class Declarator  extends Token {
    
    make( gen ){
        gen.withString( this.stack.value() );
    }
}

module.exports = Declarator;