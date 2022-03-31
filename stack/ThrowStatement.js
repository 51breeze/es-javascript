const Syntax = require("../core/Syntax");
class ThrowStatement extends Syntax{
    emitter(){
        const argument = this.make( this.stack.argument );
        return `throw ${argument}`;
    }
}

module.exports = ThrowStatement;