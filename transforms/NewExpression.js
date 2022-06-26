const Syntax = require("../core/Syntax");
class NewExpression extends Syntax{
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