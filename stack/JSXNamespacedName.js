const Syntax = require("../core/Syntax");
class JSXNamespacedName extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXNamespacedName;