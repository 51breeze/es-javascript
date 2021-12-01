const Syntax = require("../core/Syntax");
class JSXAttribute extends Syntax{
    emitter(){
        const name = this.make( this.stack.name );
        const value = this.make( this.stack.value );
        if( this.stack.isMemberProperty ){
            return [`${name}`, value];
        }
        return [name, value];
    }
}

module.exports = JSXAttribute;