const Syntax = require("../core/Syntax");
class JSXElement extends Syntax{
    
    makeProperty(attrs, level=0){
        const props = [];
        for(var n in attrs){
            if( typeof attrs[n] ==='object' ){
                const value = this.makeProperty( attrs[n] , level);
                if( value ){
                    props.push( `"${n}":${value}` );
                }
            }else if( attrs ){
                props.push( `"${n}":${attrs[n]}` );
            }
        }
        if( props.length > 0 ){
            const indent = this.getIndent(level);
            return `{\r\n${indent}\t${props.join(",\r\n\t"+indent)}\r\n${indent}\t}`;
        }
        return null;
    }

    getIndent(num=0){
        const level =  this.getIndentNum()+num ;
        return level > 0 ? "\t".repeat( level ) : '';
    }

    cleanWhitespace(element){
        return element.replace(/^[\s\r\n\t]+/g,'');
    }

    makeDirectives(child, element, prevResult, level){
        const cmd=[];
        const indent = this.getIndent( level );
        let content = [];
        if( !child.directives || !(child.directives.length > 0) ){
            return {cmd,content:[element]};
        }
        const directives = child.directives.slice(0).sort( (a,b)=>{
            return b.name.value() === 'foreach' ? -1 : 0;
        });
       
        while( directives.length > 0){
            const directive = directives.shift();
            const name = directive.name.value();
            const condition = directive.value && directive.value.value();
            if( name ==="foreach" || name ==="for" ){
                let [refs, item] = condition.split('as').map( value=>value.trim() );
                if( cmd.includes('if') ){
                    cmd.pop();
                    content.push('null');
                    element = content.splice(0,content.length).join(' : ');
                }
                element = this.cleanWhitespace(element.replace(/([\t]+)/g,'$1\t'));
                if( name ==="foreach"){
                    content.push(`\r\n${indent}${refs.trim()}.map(function(${item.trim()}){\r\n${indent}\treturn ${element};\r\n${indent}})`);
                }else{
                    let [_item, key, index] =  item.split(',').map( val=>val.trim() );
                    let dec = index ? `${indent}\t\t${index}++;` : '';
                    let code = [`${indent}(function(${refs}){`];
                    if( !key ){
                        key = `_${_item}Key`;
                    }

                    item = _item;
                    code.push(`${indent}\tvar _${refs} = [];`);
                    code.push(`${indent}\tif( typeof ${refs} ==='number' ){`);
                    code.push(`${indent}\t\t${refs} = Array.from({length:${refs}}, function(v,i){return i;});`);
                    code.push(`${indent}\t}`);
                    if( dec ){
                        code.push( `${indent}\tvar ${index}=0;` );
                    }
                    code.push(`${indent}\tfor(var ${key} in ${refs}){`);
                    code.push(`${indent}\t\tvar ${item} = ${refs}[${key}];`);
                    code.push(`${indent}\t\t_${refs}.push(${element});`);
                    if( dec ){
                        code.push(dec);
                    }
                    code.push(`${indent}\t}`);
                    code.push(`${indent}\treturn _${refs};`);
                    code.push(`${indent}}(${refs}))`);
                    content.push(`\r\n${code.join("\r\n")}`);
                }
                cmd.push(name);
            }else if( name ==="if" ){
                content.push( `\r\n${indent}${condition} ? ${this.cleanWhitespace(element)}` )
                cmd.push(name);
            }else if( name ==="elseif" ){
                if( !prevResult || !(prevResult.cmd.includes('if') || prevResult.cmd.includes('elseif')) ){
                    directive.name.error(1114, name);
                }else{
                    cmd.push(name);
                }
                content.push( `\r\n${indent}${condition} ? ${this.cleanWhitespace(element)}` );
            }else if( name ==="else"){
                if( !prevResult || !(prevResult.cmd.includes('if') || prevResult.cmd.includes('elseif')) ){
                    directive.name.error(1114, name);
                }else{
                    cmd.push(name);
                }
                content.push( element );
            }else{
                content.push( element );
            }
        }
        return {cmd,content};
    }

    makeChildren(children,level){
        const content = [];
        const part = [];
        const inline = this.getIndent(level);
        let len = children.length;
        let index = 0;
        let last = null;
        let result = null;
        const next = ()=>{
            if( index<len ){
                const child = children[index++];
                return this.makeDirectives(child, this.make(child, level+1) , last, level+1);
            }
            return null;
        }
        
        while(true){
            result = next();
            if( last ){
                let value = null;
                const hasIf = last.cmd.includes('if');
                if( hasIf ){
                    if( result && result.cmd.includes('elseif') ){
                        result.cmd = last.cmd.concat( result.cmd );
                        result.content = last.content.concat( result.content );
                    }else if(result && result.cmd.includes('else') ){
                        value = last.content.concat( result.content ).join(' : ');
                        last.end = true;
                    }else if( result && result.cmd.includes('if') ){
                        value = last.content.join('');
                    }else {
                        last.content.push('null');
                        last.end = true;
                        value = last.content.join(' : ');
                    }
                }else if( !last.end ){
                    value = last.content.join(''); 
                }
                if( last.cmd.includes('foreach') || last.cmd.includes('for')){
                    if( part.length > 0 ){
                        content.push( part.splice(0, part.length) );
                    }
                    if( value ){
                        content.push( value );
                    }
                }else{
                    if( value ){
                        part.push( value );
                    }
                }
            }
            last = result;
            if( !result )break;
        }

        if( part.length > 0 ){
            content.push( part.splice(0, part.length) );
        }

        const segments = []
        content.forEach( item=>{
            if( Array.isArray(item) && item.length > 0 ){
                if( item.length === 1 && !children[0].isJSXElement ){
                    segments.push( `[${item.join(`,`)}]` )
                }else{
                    segments.push( `[${item.join(`,`)}\r\n${inline}]` )
                }
            }else{
                segments.push( item );
            }
        });
        if( segments.length > 1 ){
            const base = segments.shift();
            return `${base}.concat(${segments.join(`\r\n${inline}).concat(`)})`;
        }
        return segments[0];
    }

    makeElement(name,data,children,level=0){
        const handle = this.getJsxCreateElementHandle();
        let inline = this.getIndent(level);
        let first = this.stack.parentStack.isJSXElement ?  `\r\n${inline}` : '';
        data = this.makeProperty(data,level);
        if( children && children.length > 0 ){
            return `${first}${handle}(${name},${data}, ${this.makeChildren(children,level)})`;
        }else if(data){
            return `${first}${handle}(${name},${data})`;
        }else{
            return `${first}${handle}(${name})`;
        }
    }

    makeClass(script, children, props, level){
        let element = children.length > 0 ?  this.makeChildren(children,level) : null;
        if( children.length > 0 ){
            const handle = this.getJsxCreateElementHandle();
            const inline = this.getIndent(level);
            element =  `${handle}('div',null, ${element})`
        }

        const properties = [];
        for( var name in props ){
            properties.push(`${name} = ${props[name]}`);
        }

        const references = [];
        this.stack.jsxReferences.forEach(name=>{
            references.push( this.semicolon(`var ${name} = this.${name}`) );
        });

        const classContent = this.make( script, (context)=>{
            const indent = this.getIndent(level-1);
            const hand = this.getJsxCreateElementHandle();
            return `function render(${hand}){\r\n${references.join('\r\n')}\r\n${indent}\treturn ${element};\r\n${indent}}`
        }, properties );

        if( this.module.isFragment ){
            return `(function(){\r\n\t\t${classContent.replace(/([\r\n\t]+)/g,'$1\t\t')}\r\n\t}())`;
        }
        return classContent;
    }

    createAttributes( data ){
        this.stack.openingElement.attributes.forEach(item=>{
            if( item.isAttributeXmlns || item.hasNamespaced ){
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
    }

    createProperties(children,data,level){
        children.forEach( child=>{
            if( child.isProperty ){
                const [name,value] = this.make( child, level );
                data.props[name] = value;
            }
        });
    }

    createElement(level){
        const children = this.stack.children.filter(child=>!(child.isJSXScript || child.isJSXStyle));
        const script = this.stack.children.find( child=>child.isJSXScript );
        const style  = this.stack.children.find( child=>child.isJSXStyle );
        const data={
            props:{},
            attrs:{},
            on:{},
            domProps:{}
        };
        this.createAttributes(data);
        this.createProperties(children,data,level);
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
        return this.createElement( level );
    }
}

module.exports = JSXElement;