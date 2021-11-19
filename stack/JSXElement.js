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
            return `{\r\n${indent}\t${props.join(",\r\n\t"+indent)}\r\n${indent}\t}`;
        }
        return null;
    }

    getIndent(num=0){
        const level = this.getLevel( this.getIndentNum()+num );
        return level > 0 ? "\t".repeat( level ) : '';
    }

    makeElement(name,data,children,level=0){
        const handle = this.getJsxCreateElementHandle();
        const inline = this.getIndent(level);
        const first = (this.stack.jsxRootElement === this.stack || this.stack.jsxRootElement === this.stack.parentStack) && 
                        this.stack.jsxRootElement.isComponent ? '' : inline;

        data = this.makeProperty(data,level);             
        if( children && children.length > 0 ){
            return `${first}${handle}(${name},${data}, [\r\n\t${children.join(`,\r\n\t`)}\r\n${inline}\t])`
        }else if(data){
            return `${first}${handle}(${name},${data})`
        }else{
            return `${first}${handle}(${name})`;
        }
    }

    makeClass(script, children, props, level){
        let element = `null`;
        if( children.length === 1 ){
            element = children[0];
        }else if( children.length > 0 ){
            const handle = this.getJsxCreateElementHandle();
            const inline = this.getIndent(level);
            element =  `${handle}('div',null, [\r\n\t${children.join(`,\r\n\t`)}\r\n${inline}\t])`
        }

        const properties = [];
        for( var name in props ){
            properties.push(`${name} = ${props[name]}`);
        }

        const classContent = this.make( script, (context)=>{
            const indent = this.getIndent(level);
            const hand = this.getJsxCreateElementHandle();
            return `function render(${hand}){\r\n${indent}\treturn ${element};\r\n${indent}}`
        }, properties );

        if( this.module.isFragment ){
            return `(function(){\r\n\t\t${classContent.replace(/([\r\n\t]+)/g,'$1\t\t')}\r\n\t}())`;
        }
        return classContent;
    }

    createElement(level){
        const children = [];
        let script = null;
        let style  = null;
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
            const [name,value] = this.make( item );
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

        this.stack.children.forEach( child=>{
            if( child.isJSXScript  ){
                script = child;
            }else if( child.isJSXStyle ){
                style = child;
            }else if( child.isProperty ){
                const [name,value] = this.make( child, level );
                data.props[name] = value;
            }else {
                const value = this.make(child,level+1);
                if( value ){
                    children.push( value );
                }
            }
        });

        if( style ){

        }

        if( script ){
            return this.makeClass(script, children, data.props, level);
        }else{
            return this.makeElement(
                this.make(this.stack.openingElement),
                data, 
                children,
                level
            );
        }
    }

    emitter(level=0){
        if( this.stack.isProperty ){
            const desc = this.stack.description();
            console.log( '===========' , desc.toString() )
            const name = desc.isMethodDefinition ? desc.value() : desc.isPropertyDefinition ? desc.id.value() : null;
            return [`this.${name}`,`null`];
        }else{
            return this.createElement(level);
        }
    }
}

module.exports = JSXElement;