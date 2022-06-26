const Token = require("../core/Token");
class MethodDefinition extends Token{
    constructor(stack){
        super(stack);
        this.kind= stack.kind;
    }

    createChildren(stack){
        this.key = this.createToken(stack.key);
        this.expression = this.createToken( this.stack.expression );
        this.modifier = stack.compiler.callUtils('getModifierValue', stack);
    }

    emitter(){
        return this.make(this.stack.expression);
    }
}

module.exports = MethodDefinition;