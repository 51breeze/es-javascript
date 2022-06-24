const Syntax = require("../core/Syntax");
class ReturnStatement extends Syntax{
    emitter(){
        const argument = this.stack.argument && this.make( this.stack.argument);
        if( this.stack.fnScope.async ){
            return this.semicolon(`return [2, ${argument}]`);
        }
        return this.semicolon(`return ${argument}`);
    }
}

module.exports = ReturnStatement;