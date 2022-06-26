const Syntax = require("../core/Syntax");
class JSXOpeningElement extends Syntax{
    emitter(){
        if( this.stack.parentStack.isComponent ){
            const desc = this.stack.parentStack.description();
            if( this.stack.hasNamespaced ){
                if( desc ){
                    if( desc.isFragment ){
                        return desc.id;
                    }else{
                        return this.getModuleReferenceName( desc );
                    }
                }
            }
            if( desc ){
                return this.getModuleReferenceName( desc );
            }
            return this.stack.name.value();
        }else{
            return `'${this.stack.name.value()}'`;
        }
    }
}
module.exports = JSXOpeningElement;