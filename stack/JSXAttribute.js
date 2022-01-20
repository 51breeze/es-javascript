const Syntax = require("../core/Syntax");
class JSXAttribute extends Syntax{
    emitter(){
        let ns = null;
        if( this.stack.hasNamespaced ){
            const xmlns = this.stack.getXmlNamespace();
            if( xmlns ){
                ns = xmlns.value.value();
            }else {
                const nsStack = this.stack.getNamespaceStack();
                const ops = this.getOptions();
                ns = ops.jsx.xmlns.default[ nsStack.namespace.value() ] || ns;
            }
        }

        let name = this.make( this.stack.name );
        let value = this.stack.value ? this.make( this.stack.value ) : true;

        if( this.stack.isMemberProperty ){
            const eleClass = this.stack.jsxElement.getSubClassDescription();
            const propsDesc = this.stack.getAttributeDescription( eleClass );
            const annotations = propsDesc && propsDesc.annotations;
            const annotation = annotations && annotations.find( annotation=>annotation.name.toLowerCase() ==='alias' );
            if( annotation ){
                const [named] = annotation.getArguments();
                if( named ){
                    if( named.isObjectPattern ){
                        name = named.extract[0].value;
                    }else{
                        name = named.value;
                    }
                }
            }
        }
    
        if( ns ==="@binding" && this.stack.value ){
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

        return [name, value, ns];
    }
}

module.exports = JSXAttribute;