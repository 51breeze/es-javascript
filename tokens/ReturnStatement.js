const Token = require("../core/Token");
class ReturnStatement extends Token{

    constructor(stack){
        super(stack);
        this.argument = this.createToken( stack.argument );
    }

    emitter(){
        const argument = this.stack.argument && this.make( this.stack.argument);
        if( this.stack.fnScope.async ){
            return this.semicolon(`return [2, ${argument}]`);
        }
        return this.semicolon(`return ${argument}`);
    }
}

module.exports = ReturnStatement;