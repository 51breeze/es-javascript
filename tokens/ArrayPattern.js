const Token = require("../core/Token");
class ArrayPattern extends Token {
    
    createChildren(stack){
        this.elements = stack.elements.map( item=>this.createToken(item) );
    }

    make( gen ){
        gen.withBracketL();
        gen.withSequence( this.elements );
        gen.withBracketR();
    }
}
module.exports = ArrayPattern;