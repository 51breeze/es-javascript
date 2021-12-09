const Syntax = require("../core/Syntax");
const map = {
    'on':'@events',
    'bind':'@binding',
}
class JSXAttribute extends Syntax{
    emitter(){
        let ns = null;
        if( this.stack.hasNamespaced ){
            const xmlns = this.stack.getXmlNamespace();
            if( xmlns ){
                ns = xmlns.value.value();
            }else {
                ns = map[ this.stack.name.namespace.value() ] || ns;
            }
        }

        let name = this.make( this.stack.name );
        let value = this.stack.value ? this.make( this.stack.value ) : null;

        if( ns ==="@binding" && value ){
            const desc = this.stack.value.description();
            let has = false;
            if(desc){
                has =(desc.isPropertyDefinition && !desc.isReadonly) || 
                     (desc.isMethodGetterDefinition && desc.module && desc.module.getMember( desc.key.value(), 'set') );
            }
            if( !has ){
                this.stack.value.error(10000,value);
            } 
        }

        if( this.stack.isMemberProperty ){
            return [`${name}`, value, ns];
        }
        return [name, value, ns];
    }
}

module.exports = JSXAttribute;