const Syntax = require("../core/Syntax");
class JSXOpeningElement extends Syntax{
    emitter(){
        if( this.stack.parentStack.isComponent ){
            if( this.stack.name.isJSXNamespacedName ){
                const xmlns = this.stack.parentStack.getXmlNamespace();
                const name = this.stack.name.name.value();
                const ns = xmlns.value.value();
                const componentModule = this.getModuleById( ns ? `${ns}.${name}` : name );
                return this.getModuleReferenceName( componentModule );
            }else{
                const componentModule = this.getModuleById( this.stack.name.value() );
                return this.getModuleReferenceName( componentModule );
            }
        }else{
            return `'${this.stack.name.value()}'`;
        }
        
    }
}

module.exports = JSXOpeningElement;