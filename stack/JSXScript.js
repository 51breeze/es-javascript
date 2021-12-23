const Syntax = require("../core/Syntax");
class JSXScript extends Syntax{
    emitter(){
        if( this.parentStack === this.stack.jsxElement.jsxRootElement ){
            return this.make( this.compilation.stack );
        }else{
            return null;
        }
    }
}

module.exports = JSXScript;