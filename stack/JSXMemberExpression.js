const Syntax = require("../core/Syntax");
class JSXMemberExpression extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}
module.exports = JSXMemberExpression;