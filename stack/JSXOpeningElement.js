const Syntax = require("../core/Syntax");
class JSXOpeningElement extends Syntax{
    emitter(){
        if( this.stack.parentStack.isComponent ){
            if( this.stack.hasNamespaced ){
                const desc = this.stack.parentStack.description();
                if( desc ){
                    if( desc.isFragment ){
                        return desc.id;
                    }else{
                        return this.getModuleReferenceName( desc );
                    }
                }
            }else{
                return this.stack.name.value();
            }
        }else{
            return `'${this.stack.name.value()}'`;
        }
    }
}
module.exports = JSXOpeningElement;