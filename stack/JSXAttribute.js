const Syntax = require("../core/Syntax");
class JSXAttribute extends Syntax{
    emitter(){
        const name = this.make( this.name );
        const value = this.make( this.value );
        if( this.name.hasNamespaced && this.name.namespace.value() ==='xmlns'){
            return null;
        }
        return `"${name}":${value}`;
    }
}

module.exports = JSXAttribute;