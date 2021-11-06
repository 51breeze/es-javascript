const Syntax = require("../core/Syntax");
class JSXIdentifier extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}
module.exports = JSXIdentifier;