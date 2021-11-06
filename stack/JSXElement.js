const Syntax = require("../core/Syntax");
class JSXElement extends Syntax{
    emitter(){
        if( this.stack.isComponent ){
            
        }
        return this.stack.raw();
    }
}

module.exports = JSXElement;