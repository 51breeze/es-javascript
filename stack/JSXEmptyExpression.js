const Syntax = require("../core/Syntax");
class JSXEmptyExpression extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}
module.exports = JSXEmptyExpression;