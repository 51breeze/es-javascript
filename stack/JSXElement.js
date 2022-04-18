const Syntax = require("../core/Syntax");
class JSXElement extends Syntax{
    
    makeProperty(attrs, level=0, top=true ){
        const props = [];
        const computed = [];
        const isArr = Array.isArray(attrs);
        for(var n in attrs){
            if( isArr ){
                let value = attrs[n];
                if( typeof value ==='object' || Array.isArray(value) ){
                    value = this.makeProperty(value, level, false);
                }
                props.push(value);
            }else{
                const hasComputed = n.charCodeAt(0) === 91;
                if( typeof attrs[n] ==='object' ){
                    const value = this.makeProperty( attrs[n], level+1, false);
                    if( value ){
                        if( hasComputed ){
                            computed.push([n.slice(1,-1),value])
                        }else{
                            props.push( `"${n}":${value}` );
                        }
                    }
                }else if( attrs[n] ){
                    if( hasComputed ){
                        computed.push([n.slice(1,-1),attrs[n]])
                    }else{
                        props.push( `"${n}":${attrs[n]}` );
                    }
                }
            }
        }

        let res = null;
        if( props.length > 0 ){
            const indent = this.getIndent(level);
            if( isArr ){
                res = `[\r\n${indent}\t${props.join(",\r\n\t"+indent)}\r\n${indent}\t]`;
            }else {
                res = `{\r\n${indent}\t${props.join(",\r\n\t"+indent)}\r\n${indent}\t}`;
            }
        }

        if( computed.length > 0 ){
            if( this.compilation.JSX ){
                const target = this.stack.jsxRootElement;
                const refName =  this.generatorVarName(target,'_c');
                target.dispatcher("insertBefore",this.semicolon(`var ${refName}`));
                return `(${refName}=${res||'{}'},${computed.map(item=>`${refName}[${item[0]}]=${item[1]}`).join(',')},${refName})`
            }else{
                const target = this.stack.jsxRootElement.getParentStack( stack=>!!stack.isFunctionExpression );
                const refName =  this.generatorVarName(target,'_c');
                target.dispatcher("insertBefore",this.semicolon(`var ${refName}`));
                return `(${refName}=${res||'{}'},${computed.map(item=>`${refName}[${item[0]}]=${item[1]}`).join(',')},${refName})`
            }
        }

        return res;
    }

    getIndent(num=0){
        const level =  this.getIndentNum()+num ;
        return level > 0 ? "\t".repeat( level ) : '';
    }

    cleanWhitespace(element){
        return element.replace(/^[\s\r\n\t]+/g,'');
    }

    makeIterationFun(name, refs, refName, element, indent,  item, key, index){
        element = this.cleanWhitespace(element.replace(/([\t]+)/g,'$1\t'));
        if( name ==="each"){
            const args = [item];
            if(key)args.push(key);
            return `${refs}.map((function(${args.join(',')}){\r\n${indent}\treturn ${element};\r\n${indent}}).bind(this))`;
        }else{
            let dec = index ? `${indent}\t\t${index}++;` : '';
            let code = [`(function(${refName}){`];
            if( !key ){
                key = `_${item}Key`;
            }
            code.push(`${indent}\tvar _${refName} = [];`);
            code.push(`${indent}\tif( typeof ${refName} ==='number' ){`);
            code.push(`${indent}\t\t${refName} = Array.from({length:${refName}}, function(v,i){return i;});`);
            code.push(`${indent}\t}`);
            if( dec ){
                code.push( `${indent}\tvar ${index}=0;` );
            }
            code.push(`${indent}\tfor(var ${key} in ${refName}){`);
            code.push(`${indent}\t\tvar ${item} = ${refName}[${key}];`);
            code.push(`${indent}\t\t_${refName}.push(${element});`);
            if( dec ){
                code.push(dec);
            }
            code.push(`${indent}\t}`);
            code.push(`${indent}\treturn _${refName};`);
            code.push(`${indent}}).call(this,${refs})`);
            return code.join("\r\n");
        }
    }

    makeDirectives(child, element, prevResult, level){
        const cmd=[];
        const indent = this.getIndent( level );
        let content = [];
        if( !child.directives || !(child.directives.length > 0) ){
            return {cmd,child,content:[element]};
        }
        const directives = child.directives.slice(0).sort( (a,b)=>{
            return b.name.value() === 'each' ? -1 : 0;
        });
       
        while( directives.length > 0){
            const directive = directives.shift();
            const name = directive.name.value();
            const valueArgument = directive.valueArgument;
            if( name ==="each" || name ==="for" ){
                let refs = this.make(valueArgument.expression);
                let item = valueArgument.declare.item;
                let key = valueArgument.declare.key;
                let index = valueArgument.declare.index;
                if( cmd.includes('if') ){
                    cmd.pop();
                    content.push('null');
                    element = content.splice(0,content.length).join(' : ');
                }
                element = this.cleanWhitespace(element.replace(/([\t]+)/g,'$1\t'));
                if( name ==="each"){
                    content.push(`\r\n${indent}${this.makeIterationFun( name, refs , this.generatorVarName(child,'_refs'), element, indent, item, key)}`);
                }else{
                    content.push(`\r\n${this.makeIterationFun( name, refs , this.generatorVarName(child,'_refs'), element, indent, item, key, index )}`);
                }
                cmd.push(name);
            }else if( name ==="if" ){
                content.push( `\r\n${indent}${this.make(valueArgument.expression)} ? ${this.cleanWhitespace(element)}` )
                cmd.push(name);
            }else if( name ==="elseif" ){
                if( !prevResult || !(prevResult.cmd.includes('if') || prevResult.cmd.includes('elseif')) ){
                    directive.name.error(1114, name);
                }else{
                    cmd.push(name);
                }
                content.push( `\r\n${indent}${this.make(valueArgument.expression)} ? ${this.cleanWhitespace(element)}` );
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
                if( child.isSlot && !child.isSlotDeclared ){
                    const name = child.openingElement.name.value();
                    if( child.attributes.length > 0 ){
                        data.scopedSlots[ name ] = elem.content.join('');
                        return next();
                    }
                }else if( child.isDirective ){
                    let last = elem;
                    let valueGroup = [];
                    last.cmd.push( child.openingElement.name.value() )
                    while(true){
                        const maybeChild = index < len && children[index].isDirective ? children[index++] : null;
                        const maybe=  maybeChild ? this.makeDirectives(maybeChild, this.make(maybeChild, level+1) , last, level+1) : null;
                        const hasIf = last.cmd.includes('if')
                        const isDirective = maybe && maybe.child.isDirective;
                        if( isDirective ){
                            maybe.cmd.push( maybeChild.openingElement.name.value() )
                        }
                        if( hasIf ){
                            if( isDirective && maybe.cmd.includes('elseif') ){
                                maybe.cmd = last.cmd.concat( maybe.cmd );
                                maybe.content = last.content.concat( maybe.content );
                            }else if( isDirective && maybe.cmd.includes('else') ){
                                valueGroup.push( last.content.concat( maybe.content ).join(' : ') );
                                maybe.ifEnd = true;
                            }else{
                                last.content.push('null');
                                if(maybe)maybe.ifEnd = true;
                                valueGroup.push( last.content.join(' : ') );
                            }
                        }else if( !last.ifEnd ){
                            valueGroup.push( last.content.join('') );
                        }
                        if( maybe ){
                            last = maybe
                        }
                        if( !isDirective ){
                            break;
                        }
                    }
                    last.content = valueGroup.slice(0);
                    last.cmd.length = 0;
                    delete last.ifEnd;
                    return last;
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
                        result.ifEnd = true;
                    }else{
                        last.content.push('null');
                        if(result)result.ifEnd = true;
                        value = last.content.join(' : ');
                    }
                }else if( !last.ifEnd ){
                    value = last.content.join( last.child.isDirective ? `,\r\n\t${inline}` : '');
                }
                const complex = last.child.isJSXExpressionContainer ? !!(last.child.expression.isMemberExpression || last.child.expression.isCallExpression) : false;
                if( last.cmd.includes('each') || last.cmd.includes('for') || last.child.isSlot || last.child.isDirective || complex ){
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
            return `${base}.concat(${segments.join(`).concat(\r\n\t${inline}`)})`;
        }
        return segments[0];
    }

    makeElement(name,data,children,level){
        const elements = children && children.length > 0 ? this.makeChildren(children,data,level) : null;
        let inline = this.getIndent(level);
        let first = this.stack.parentStack.isJSXElement ?  `\r\n${inline}` : '';
        let handle = this.getJsxCreateElementHandle();
        if( !this.compilation.JSX || !this.stack.jsxRootElement.isProgram ){
            const stackMethod = this.stack.getParentStack( stack=>{
                return !!(stack.isMethodDefinition || stack.isJSXExpressionContainer);
            });
            if( !(stackMethod && stackMethod.isJSXExpressionContainer) ){
                handle = this.generatorRefName(this.stack.jsxRootElement,handle,handle,()=>{
                    return this.getJsxCreateElementRefs();
                });
            }
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

    getRenderMethod(children, data, level){

        const root = this.stack.jsxRootElement;
        const insertBefore = [];
        root.removeAllListeners("insertBefore")
        root.addListener("insertBefore",(content)=>{
            if( content ){
                insertBefore.push(content);
            }
        });

        root.once("insertThisName",(name)=>{
            insertBefore.push( this.semicolon(`\tvar ${name} = this`) )
        });

        let element = children && children.length > 0 ?  this.makeChildren(children, data,level) : null;
        if( children.length > 1 ){
            const _data = this.makeProperty(data,level);
            const handle = this.getJsxCreateElementHandle();
            element =  `${handle}('div', ${_data}, ${element})`
        }

        const properties = [];
        const props = data.props;
        for( var name in props ){
            properties.push(`${name} = ${props[name]}`);
        }

        const references = insertBefore;
        references.push( this.emitCreateElement() );

        return (context)=>{
            const indent = this.getIndent(level-1);
            references.push( `${indent}\treturn ${element};` );
            return `function render(){\r\n${references.join('\r\n')}\r\n${indent}}`;
        };
    }

    makeClass(children, data, level){
        return null;
    }

    createAttributes( data, spreadAttributes ){

        const pushEvent=(name,callback, category)=>{
            const events =  data[ category ];
            if( events[name] ){
                if( !Array.isArray( events[name] ) ){
                    events[name] = [ events[name] ];
                }
                if( !events[name].includes( callback ) ){
                    events[name].push( callback );
                }
            }else{
                events[name] = callback;
            }
        }

        const toFun = (item,content)=>{
            if( item.value.isJSXExpressionContainer ){
                const expr = item.value.expression;
                if( expr.isAssignmentExpression ){
                    return `(function(){${content}}).bind(this)`
                }
            }
            return content;
        }

        this.stack.openingElement.attributes.forEach(item=>{
            if( item.isAttributeXmlns || item.isAttributeDirective ){
                if( item.isAttributeDirective ){
                    const name = item.name.value();
                    if( name === 'show'){
                       data.directives.push({name:`'show'`, value:this.make( item.valueArgument.expression )});
                    }
                }
                return;
            }else if( item.isJSXSpreadAttribute ){
                spreadAttributes && spreadAttributes.push( this.make( item ) );
                return;
            }
            let [name,value,ns] = this.make( item );
            if( !value )return;

            if(ns && ns.includes('::') ){
                let [seg,className] = ns.split('::',2);
                ns = seg;
                const moduleClass = this.getModuleReferenceName( this.getModuleById(className) );
                name = `[${moduleClass}.${name}]`;
            }

            if( ns ==="@events" ){
                pushEvent( name, toFun(item,value), 'on')
                return;
            }else if( ns ==="@natives" ){
                pushEvent( name, toFun(item,value), 'nativeOn')
                return;
            }else if( ns ==="@binding" ){
                data.directives.push({name:`'model'`, value:value});
                pushEvent('input',`(function(event){${value}=event && event.target && event.target.nodeType===1 ? event.target.value : event;}).bind(this)`, 'on');
            }

            if( item.isMemberProperty ){
                data.props[name] = value;
                return;
            }

            switch(name){
                case "class" :
                case "style" :
                case "key" :
                case "ref" :
                case "refInFor" :
                case "tag" :
                case "staticClass" :
                    data[name] = value;
                    break;
                case "innerHTML" :
                    data['domProps'][name] = value;
                    break;
                case "value" :
                default:
                    data.attrs[name] = value;
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

    getElementConfig(){
        return {
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
            show:void 0,
            staticStyle:{},
            style:{},
            staticStyle:{},
            hook:{},
            model:{},
            transition:{},
            directives:[]
        };
    }

    createElement(level){
        const children = this.stack.children.filter(child=>!( (child.isJSXScript && child.isScriptProgram) || child.isJSXStyle) );
        const isRoot = this.stack.jsxRootElement === this.stack;
        const spreadAttributes = [];
        let data=this.getElementConfig();
        if( this.stack.parentStack.isSlot ){
            const name = this.stack.parentStack.openingElement.name.value();
            data.slot = `'${name}'`;
        }else if(this.stack.parentStack && this.stack.parentStack.isDirective ){
            let dName = this.stack.parentStack.openingElement.name.value();
            if( dName === 'show' ){
                const condition= this.stack.parentStack.openingElement.attributes[0];
                data.directives.push({name:`'show'`, value:this.make( condition.parserAttributeValueStack() )});
            }
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
        if(isRoot && this.compilation.JSX && this.stack.parentStack.isProgram ){
            return this.makeClass(children, data, level);
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
                return `(this.slot('${name}',true,true,{${scope.join(',')}}) || ${children})`;
            }else if(children){
                return `(this.slot('${name}') || ${children})`;
            }else{
                return `(this.slot('${name}') || [])`;
            }

        }else{
            if( stack.attributes.length > 0 ){
                const scope = stack.attributes.find( attr=>attr.name.value()==='scope' );
                const scopeName = scope && scope.value? scope.value.value() : 'scope';
                return `(this.slot('${name}',true) || (function(${scopeName}){return ${children}}).bind(this))`;
            }else if(children){
                return `(this.slot('${name}') || ${children})`;
            }else{
                return `this.slot('${name}')`;
            }
        }
    }

    createDirectiveElement(level){
        const children = this.stack.children.filter(child=>!(child.isJSXScript || child.isJSXStyle) );
        const childItems = this.makeChildren(children, this.getElementConfig(), level);
        const name = this.stack.openingElement.name.value();
        switch( name ){
            case 'show' :
                return childItems;
            case 'if' :
            case 'elseif' :
                const condition = this.make( this.stack.attributes[0].parserAttributeValueStack() )
                return `${condition} ? ${childItems} `;
            case 'else' :
                return childItems;
            case 'for' :
            case 'each' :
                const attrs = this.stack.openingElement.attributes;
                const argument = {};
                attrs.forEach( attr=>{
                    if( attr.name.value()==='name'){
                        argument[ 'refs' ] = this.make( attr.parserAttributeValueStack() );
                    }else{
                        argument[attr.name.value()] = attr.value.value();
                    }
                });
                const fun = this.makeIterationFun( name, 
                    argument.refs, 
                    this.generatorVarName(this.stack,'_refs'),
                    childItems, 
                    this.getIndent( level ), 
                    argument.item || 'item', 
                    argument.key || 'key', 
                    argument.index
                );
                return `${fun}.reduce(function(acc, val){return acc.concat(val)}, [])`
            } 
        return null;
    }

    emitter(level=0){
        if( this.stack.isSlot ){
            return this.createSlot( level );
        }else if(this.stack.isDirective){
            return this.createDirectiveElement( level );
        }else{
            return this.createElement( level );
        }
    }
}

module.exports = JSXElement;