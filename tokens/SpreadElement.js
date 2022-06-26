const Token = require("../core/Token");
class SpreadElement extends Token{

    constructor(stack){
        super(stack);
        this.argument =this.createToken(stack.argument);
    }

    emitter(){
        return this.make(this.stack.argument);
    }
}

module.exports = SpreadElement;