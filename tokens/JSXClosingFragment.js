const Syntax = require("../core/Syntax");
class JSXClosingFragment extends Syntax{
    emitter(){
        return this.stack.raw();
    }
}

module.exports = JSXClosingFragment;