const Syntax = require("../core/Syntax");
class JSXElement extends Syntax{
    
    makeProperty(attrs, level=0){
        const props = [];
        for(var n in attrs){
            if( typeof attrs[n] ==='object' ){
                const value = this.makeProperty( attrs[n] , level+1);
                if( value ){
                    props.push( `"${n}":${value}` );
                }
            }else if( attrs ){
                props.push( `"${n}":${attrs[n]}` );
            }
        }
        if( props.length > 0 ){
            const indent = this.getIndent(level+1);
            return `{\r\n${indent}${props.join(",\r\n"+indent)}\r\n${indent}}`;
        }
        return null;
    }

    getIndent(num=0){
        const level = this.getLevel( this.getIndentNum()+num );
        return level > 0 ? "\t".repeat( level ) : '';
    }

    createElement(name,data,children,level=0){
        const handle = this.getJsxCreateElementHandle();
        const inline = this.getIndent(level);
        if( children && children.length > 0 ){
            return `${inline}${handle}(${name},${this.makeProperty(data)}, [\r\n${children.join(',\r\n')}\r\n${inline}])`
        }else{
            return `${inline}${handle}(${name},${this.makeProperty(data)})`
        }
    }

    emitter(level=0){
        const data={
            props:{},
            attrs:{},
            on:{},
            domProps:{}
        };
        this.stack.openingElement.attributes.forEach(item=>{
            if( item.isAttributeXmlns ){
                return null;
            }
            const name = this.make( item.name );
            const value = this.make( item.value );
            if(name){
                if(name ==="class"){
                    data['class'] = value;
                }else if(name ==="style"){
                    data['style'] = value;
                }else if(name ==="innerHTML"){
                    data['domProps'][name] = value;
                }else if( /^on/i.test(name) ){
                    data['on'][name.substr(2)] = value;
                }else if( item.isMemberProperty ){
                    data.props[name] = value;
                }else{
                    data.attrs[name] = value;
                }
            }
        });
        return this.createElement(this.make(this.stack.openingElement), data, this.stack.children.map( child=>this.make(child,level+1) ).filter( child=>!!child ) , level);
    }
}

module.exports = JSXElement;