const Syntax = require("../core/Syntax");
class NewExpression extends Syntax{
    emiter(syntax){
        const callee= this.stack.callee.emiter(syntax);
        const args= this.stack.arguments.map( item=>item.emiter(syntax) ).join(",");
        return `new ${callee}(${args})`;
    }
}

module.exports = NewExpression;