const Syntax = require("../core/Syntax");
class NewExpression extends Syntax{
    emiter(syntax){
        const callee= this.stack.callee.emiter(syntax);
        const desc = this.stack.callee.description();
        if( this.compiler.callUtils("isTypeModule",desc) ){
            this.addDepend( desc );
        }
        const args= this.stack.arguments.map( item=>item.emiter(syntax) ).join(",");
        return `new ${callee}(${args})`;
    }
}

module.exports = NewExpression;