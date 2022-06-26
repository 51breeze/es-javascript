const Token = require("../core/Token");
class ContinueStatement extends Token{
    constructor(stack){
        super(stack);
        this.label = this.createToken(stack.label)
    }
}

module.exports = ContinueStatement;