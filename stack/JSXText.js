const Syntax = require("../core/Syntax");
class JSXText extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}
module.exports = JSXText;