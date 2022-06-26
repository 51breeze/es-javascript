const Token = require("../core/Token");
class NewExpression extends Token{
    constructor(stack){
        this.callee= this.createToken(stack.callee);
    }
    emitter(){
        const callee= this.make(this.stack.callee);
        const desc = this.stack.callee.description();
        if( this.compiler.callUtils("isTypeModule",desc) ){
            this.addDepend( desc );
        }
        const args=this.stack.arguments.map( item=> this.make(item) ).join(",");
        return `new ${callee}(${args})`;
    }
}

module.exports = NewExpression;