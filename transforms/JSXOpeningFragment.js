const Syntax = require("../core/Syntax");
class JSXOpeningFragment extends Syntax{
    emitter(){
        return this.stack.value();
    }
}

module.exports = JSXOpeningFragment;