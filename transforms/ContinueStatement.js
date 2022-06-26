const Syntax = require("../core/Syntax");
class ContinueStatement extends Syntax{
    emitter(){
        if( this.stack.label ){
            return this.semicolon(`continue ${this.stack.label.value()}`); 
        }
        return this.semicolon('continue'); 
    }
}

module.exports = ContinueStatement;