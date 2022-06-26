const Token = require("../core/Token");
const Constant = require("../core/Constant");
class MethodDefinition extends Token{

    createChildren(stack){
        this.isMethodDefinition=true;
        this.key = this.createToken(stack.key);
        this.expression = this.createToken( this.stack.expression );
        this.modifier = stack.compiler.callUtils('getModifierValue', stack);
        this.kind= Constant.DECLARE_PROPERTY_FUN;
    }

    emitter(){
        return this.make(this.stack.expression);
    }
}

module.exports = MethodDefinition;