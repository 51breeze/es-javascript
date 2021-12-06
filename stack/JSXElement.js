const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
const VueClass = require("../core/VueClass");
class JSXElement extends Syntax{
    
    makeProperty(attrs, level=0){
        const props = [];
        for(var n in attrs){
            if( typeof attrs[n] ==='object' ){
                const value = this.makeProperty( attrs[n] , level);
                if( value ){
                    props.push( `"${n}":${value}` );
                }
            }else if( attrs[n] ){
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
            return {cmd,child,content:[element]};
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
                    content.push(`\r\n${indent}${refs.trim()}.map((function(${item.trim()}){\r\n${indent}\treturn ${element};\r\n${indent}}).bind(this))`);
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
                    code.push(`${indent}}).call(this,${refs})`);
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
        return {cmd,child,content};
    }

    makeChildren(children,data,level){
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
                const elem = this.makeDirectives(child, this.make(child, level+1) , last, level+1);
                if( child.isSlot ){
                    const name = child.openingElement.name.value();
                    let refSlot = child.getSlotDescription(name);
                    if( refSlot && refSlot.attributes.length > 0 ){
                        data.scopedSlots[ name ] = elem.content.join('');
                        return next();
                    }
                }
                return elem;
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
                if( last.cmd.includes('foreach') || last.cmd.includes('for') || last.child.isSlot ){
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
            return `${base}.concat(${segments.join(`,\r\n\t${inline}`)})`;
        }
        return segments[0];
    }

    makeElement(name,data,children,level){

        const elements = children && children.length > 0 ? this.makeChildren(children,data,level) : null;
        let inline = this.getIndent(level);
        let first = this.stack.parentStack.isJSXElement ?  `\r\n${inline}` : '';
        let handle = this.getJsxCreateElementHandle();
        if( !this.compilation.JSX ){
            handle = this.generatorRefName(this.stack.jsxRootElement,handle,handle,()=>{
                return this.getJsxCreateElementRefs();
            });
        }

        data = this.makeProperty(data,level);
        if( elements ){
            return `${first}${handle}(${name},${data}, ${elements})`;
        }else if(data){
            return `${first}${handle}(${name},${data})`;
        }else{
            return `${first}${handle}(${name})`;
        }
    }

    makeClass(script, children, data, level){
        const module = this.module;
        let element = children && children.length > 0 ?  this.makeChildren(children,data,level) : null;
        if( children.length > 0 ){
            const handle = this.getJsxCreateElementHandle();
            const inline = this.getIndent(level);
            element =  `${handle}('div',null, ${element})`
        }

        const properties = [];
        const props = data.props;
        for( var name in props ){
            properties.push(`${name} = ${props[name]}`);
        }

        const references = [];
        this.stack.jsxReferences.forEach(name=>{
            references.push( this.semicolon(`var ${name} = this.${name}`) );
        });
        references.push( this.emitVueCreateElement() );

        let classContent = ``;
        const render = (context)=>{
            const indent = this.getIndent(level-1);
            const hand = this.getJsxCreateElementHandle();
            references.push( `${indent}\treturn ${element};` );
            return `function render(${hand}){\r\n${references.join('\r\n')}\r\n${indent}}`;
        };

        if( script ){
            classContent = this.make( script, render , properties );
        }else {
            const vueClass = new VueClass( this.stack );
            classContent = vueClass.emitter(render);
        }

        if( module.isFragment ){
            return `(function(){\r\n\t\t${classContent.replace(/([\r\n\t]+)/g,'$1\t\t')}\r\n\t}())`;
        }
        return classContent;
    }

    createAttributes( data, spreadAttributes ){
        this.stack.openingElement.attributes.forEach(item=>{
            if( item.isAttributeXmlns || item.hasNamespaced ){
                return;
            }else if( item.isJSXSpreadAttribute ){
                spreadAttributes && spreadAttributes.push( this.make( item ) );
                return;
            }
            const [name,value] = this.make( item );
            if(name){
                if(name ==="class"){
                    data['class'] = value;
                }else if(name ==="staticClass"){
                    data['staticClass'] = value;
                }else if(name ==="staticStyle"){
                    data['staticStyle'] = value;
                }else if(name ==="style"){
                    data['style'] = value;
                }else if(name ==="innerHTML"){
                    data['domProps'][name] = value;
                }else if(name ==="key"){
                    data[name] = value;
                }else if(name ==="ref"){
                    data[name] = value;
                }else if(name ==="refInFor"){
                    data[name] = value;
                }else if(name ==="tag"){
                    data[name] = value;
                }else if(name ==="transition"){
                    data[name] = value;
                }else if(name ==="hook"){
                    data[name] = value;
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
                const [name,value] = this.make( child, level+1 );
                data.props[name] = value;
            }else if( child.isSlot ){
                // const name = child.attributes.find( attr=>attr.name.value().toLowerCase() ==='name' );
                // const scope = child.attributes.find( attr=>attr.name.value().toLowerCase() ==='scope' );
                // const children = child.children.map( child=>this.make(child) );
            }
        });
    }

    createElement(level){
        const children = this.stack.children.filter(child=>!(child.isJSXScript || child.isJSXStyle));
        const script = this.stack.children.find( child=>child.isJSXScript );
        const style  = this.stack.children.find( child=>child.isJSXStyle );
        const isRoot = this.stack.jsxRootElement === this.stack;
        const spreadAttributes = [];
        const data={
            props:{},
            attrs:{},
            on:{},
            nativeOn:{},
            slot:void 0,
            scopedSlots:{},
            domProps:{},
            key:void 0,
            ref:void 0,
            refInFor:void 0,
            tag:void 0,
            staticClass:void 0,
            class:void 0,
            staticStyle:{},
            style:{},
            staticStyle:{},
            hook:{},
            transition:{}
        };

        if( this.stack.parentStack.isSlot ){
            const name = this.stack.parentStack.openingElement.name.value();
            data.slot = `'${name}'`;
        }

        this.createAttributes(data, spreadAttributes);
        this.createProperties(children,data,level);

        if( spreadAttributes.length > 0 ){
            const props = Object.entries(data.props);
            if( props.length > 0 ){
                const objectProps = props.map( item=>{
                    return `'${item[0]}':${item[1]}`;
                });
                data.props = `Object.assign({},${spreadAttributes.join(',')}, {${objectProps.join(',')}})`;
            }else{
                if( spreadAttributes.length > 1 ){
                    data.props = `Object.assign({},${spreadAttributes.join(',')})`
                }else{
                    data.props = spreadAttributes[0];
                } 
            }
        }

        if(isRoot && this.compilation.JSX && this.stack.isComponent){
            return this.makeClass(script, children, data, level);
        }else{
            return this.makeElement(
                this.make(this.stack.openingElement),
                data, 
                children,
                level
            );
        }
    }

    createSlot( level ){
        const stack = this.stack;
        const data = {};
        const name = stack.openingElement.name.value();
        const children = stack.children.length > 0 ? this.makeChildren(stack.children, data, level) : null;
        if( stack.isSlotDeclared ){
            const args = stack.attributes.map( attr=>{
                const key = attr.name.value();
                const value = this.make(attr.value,level);
                return {key, value};
            });
            if( args.length > 0 ){
                const scope = args.map( item=>{
                    return `${item.key}:${item.value}`;
                })
                return `(this.$scopedSlots['${name}'] ? this.$scopedSlots['${name}']({${scope.join(',')}}) : ${children})`;
            }else if(children){
                return `(this.$slots['${name}'] || ${children})`;
            }else{
                return `(this.$slots['${name}']||[])`;
            }

        }else{
            let refSlot = stack.getSlotDescription(name);
            if( refSlot ){
                if( refSlot.attributes.length > 0 ){
                    const scope = stack.attributes.find( attr=>attr.name.value()==='scope' );
                    const scopeName = scope && scope.value? scope.value.value() : 'scope';
                    return `this.$scopedSlots['${name}'] || (function(${scopeName}){return ${children}}).bind(this)`;
                }else if(children){
                    return `this.$slots['${name}'] || ${children}`;
                }else{
                    return `this.$slots['${name}']`;
                }
            }
        }
    }

    emitter(level=0){
        if( this.stack.isSlot ){
            return this.createSlot( level );
        }else{
            return this.createElement( level );
        }
    }
}

module.exports = JSXElement;