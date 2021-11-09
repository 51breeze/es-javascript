const Syntax = require("../core/Syntax");
class JSXEmptyExpression extends Syntax{
    emitter(){
        return null;
    }
}
module.exports = JSXEmptyExpression;