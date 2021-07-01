const Syntax = require("../core/Syntax");
class UpdateExpression extends Syntax {
    emiter(syntax){
        const argument = this.stack.argument.emiter(syntax);
        const operator = this.stack.node.operator;
        const prefix = this.stack.node.prefix;
        if( prefix ){
            return `${operator}${argument}`;
        }
        return `${argument}${operator}`;
    }
}

module.exports = UpdateExpression;