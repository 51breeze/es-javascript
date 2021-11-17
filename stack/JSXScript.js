const Syntax = require("../core/Syntax");
class JSXScript extends Syntax{
    emitter(){
        return `function ${this.module.id}(){}`;
    }
}

module.exports = JSXScript;