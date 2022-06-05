const Syntax = require("../core/Syntax");
class ThrowStatement extends Syntax{
    emitter(){
        const argument = this.make( this.stack.argument );
        return this.semicolon(`throw ${argument}`);
    }
}

module.exports = ThrowStatement;