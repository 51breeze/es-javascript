const Syntax = require("../core/Syntax");
class BreakStatement extends Syntax{
    emitter(){
        const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
        const label = this.stack.label ? this.stack.label.value() : '';
        if( stack.hasAwait ){
            return this.semicolon(`return [3, ${(this.createDataByStack(stack).awaitCount)+1}]`);
        }
        return this.semicolon(label ? `break ${label}` : `break`);
    }
}
module.exports = BreakStatement;