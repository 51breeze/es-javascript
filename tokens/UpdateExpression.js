const Syntax = require("../core/Syntax");
class UpdateExpression extends Syntax {
    emitter(){
        const argument = this.make(this.stack.argument);
        const operator = this.stack.node.operator;
        const prefix = this.stack.node.prefix;
        if( prefix ){
            return `${operator}${argument}`;
        }
        return `${argument}${operator}`;
    }
}

module.exports = UpdateExpression;