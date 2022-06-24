const Syntax = require("../core/Syntax");
class JSXNamespacedName extends Syntax{
    emitter(){
        return this.stack.value();
    }
}

module.exports = JSXNamespacedName;