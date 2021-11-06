const Syntax = require("../core/Syntax");
class JSXFragment extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXFragment;