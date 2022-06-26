const Syntax = require("../core/Syntax");
class JSXIdentifier extends Syntax{
    emitter(){
        return this.stack.value();
    }
}
module.exports = JSXIdentifier;