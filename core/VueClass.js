const Syntax = require("./Syntax");
const Constant = require("./Constant");
class VueClass extends Syntax{

    emitStack(item,name,isStatic,properties,modifier){
        if( !item )return null;
        const metaTypes = item.metatypes;
        const annotations = item.annotations;
        if( !this.checkMetaTypeSyntax(metaTypes) ){
            return null;
        }
        const value = this.make(item);
        if( value ){
            if( item.isPropertyDefinition ){
                if( !isStatic && modifier === "private"){
                    properties.push(`'${name}':${value||null}`);
                    //return null;
                }
                return value;
            }else{
                return value;
            }
        }
        return null;
    }

    buildExternal(){
        const stack = this.parentStack.parentStack || this.parentStack;
        if( stack && stack.externals.length > 0 ){
            const externals = stack.externals.map( item=>this.make(item) ).filter(item=>!!item);
            if( externals.length > 0 ){
                return [ 
                    this.semicolon('/*externals code*/'),
                    this.semicolon(`(function(){\r\n\t${externals.join("\r\n\t")}\r\n}())`)
                ].join("\r\n");
            }
        }
        return null;
    }

    emitter( render , initProperties){
        const module = this.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const initialProps = initProperties && initProperties.length > 0 ? initProperties.map( item=>this.semicolon(`\t${item}`) ).join('\r\n') : [];
        const content = [];
        const imps    = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [];
        const props = [];
        const data = [];
        const isWeb = this.isInheritWebComponent( module );
        const reserved = isWeb ? this.getConfig('reserved.vue') : [];
        const _private = Constant.REFS_DECLARE_PRIVATE_NAME;
        const classScope = this.stack.scope.getScopeByType("class");
        const topRefs = new Map();
        const methodContent = [];
        const memberContent = [];
        const emitter=(target,proto,content,isStatic,descriptive)=>{
            for( var name in target ){
                const item = target[ name ];
                const modifier = item.modifier ? item.modifier.value() : 'public';
                if( isWeb && Array.isArray(reserved) && reserved.includes(name) ){
                    item.error(1124,name);
                }
                if( item.isPropertyDefinition ){
                    const value = this.emitStack(item,name,isStatic,properties,modifier);
                    const kind = item.kind ==="var" ?  Constant.DECLARE_PROPERTY_VAR : Constant.DECLARE_PROPERTY_CONST;
                    content.push(this.definePropertyDescription(
                        proto,
                        name,
                        value,
                        false,
                        modifier,
                        kind,
                        descriptive,
                        isWeb
                    ));

                    if( !isStatic ){
                        if( modifier ==="public" ){
                            const type = this.getAvailableOriginType( item.type() );
                            if( value ){
                                props.push( `${name}:{type:${type},default:${value}}` );
                            }else{
                                props.push( `${name}:{type:${type}}` );
                            }
                        }else{
                            data.push( `${name}:${value || null}` );
                        }
                    }
                    
                }else if( item.isAccessor ){
                    content.push(this.definePropertyDescription(
                        proto,
                        name,
                        {
                            get:this.emitStack(item.get,name,isStatic,properties),
                            set:this.emitStack(item.set,name,isStatic,properties)
                        },
                        true,
                        modifier,
                        Constant.DECLARE_PROPERTY_ACCESSOR,
                        descriptive,
                        isWeb
                    ));
                    if( !isStatic && item.set ){
                        if( modifier === "public" ){
                            const type = this.getAvailableOriginType( item.set.params[0] && item.set.params[0].type() );
                            props.push( `${name}:{type:${type}}` );
                        }else{
                            data.push( `${name}:${null}` );
                        }
                    }
                }else{
                    let kind = Constant.DECLARE_PROPERTY_FUN;
                    content.push(this.definePropertyDescription(
                        proto,
                        name,
                        this.emitStack(item,name,isStatic,properties),
                        false,
                        modifier,
                        kind,
                        descriptive
                    ));
                }
            }
        }

        refs.push(`var ${_private}=Symbol("private");`);
        classScope.removeAllListeners("insertTopRefsToClassBefore");
        classScope.addListener("insertTopRefsToClassBefore",(object)=>{
            topRefs.set(object.name,object.value);
        });

        if( render ){
            memberContent.push(this.definePropertyDescription(
                `members`,
                'render',
                render( this ),
                false,
                'public',
                Constant.DECLARE_PROPERTY_FUN,
                false
            ));
        }
        
        emitter( methods , 'methods', methodContent , true);
        emitter( members , `members`, memberContent , false);

        const iteratorType = this.getGlobalModuleById("Iterator")
        const Component = this.getGlobalModuleById('web.components.Component');
        this.addDepend( Component );
        this.addDepend( this.getGlobalModuleById('Class') );
        
        if( module.implements.includes(iteratorType) ){
            memberContent.push(`members[Symbol.iterator]={value:function(){return this;}}`)
        }

        if( module.methodConstructor ){
            module.methodConstructor.once("fetchClassProperty",(event)=>{
                event.properties = `{${properties.join(",")}}`;
                event.initialProps = initialProps.join("\r\n");
            });
        }

        const construct = module.methodConstructor ? this.make(module.methodConstructor) : this.createDefaultConstructor(module, inherit, properties, initialProps);
        const callConstructor = [
            this.semicolon(`(${construct}).call(this,options)`),
        ]
        memberContent.push(`members._init={value:function _init(options){\r\n${callConstructor.join('\r\n')}\r\n}}`)

        let _methods = null;
        let _members = null;
        if( methodContent.length > 0 ){
            content.push(`var methods = {};`);
            content.push.apply(content, methodContent);
             _methods='methods';
        }

        if( memberContent.length > 0 ){
            content.push(`var members = {};`);
            content.push.apply( content, memberContent )
            _members = 'members';
        }

        const description = this.createClassDescription(module, inherit, imps, _methods, _members, _private);
        const createConstructor = this.semicolon(`var ${module.id} = ${this.getModuleReferenceName(Component, module)}.createComponent(${this.createOptions(module.id,inherit,props,data)})`);
        
        this.createDependencies(module,refs);
        
        //alias refs
        if( topRefs.size > 0 ){
            topRefs.forEach( (value,name)=>{
                refs.push( `var ${value} = ${name};` );
            });
        }

        const parts = refs.concat(createConstructor,content);
        const external = this.buildExternal();

        parts.push( this.emitCreateClassDescription( module, description) );
        parts.push( this.emitExportClass(module) );
        if( external ){
            parts.push( external );
        }

        return parts.join("\r\n");
    }

    createClassDescription(module, inherit, imps, methods, members, _private){
        const description = [
            `'id':${Constant.DECLARE_CLASS}`,
            `'ns':'${module.namespace.toString()}'`,
            `'name':'${module.id}'`,
        ];
        if( _private ){
            description.push(`'private':${_private}`);
        }
        if( imps.length > 0 ){
            description.push(`'imps':[${imps.map(item=>this.getModuleReferenceName(item)).join(",")}]`);
        }
        if( inherit ){
            description.push(`'inherit':${this.getModuleReferenceName( inherit, module)}`);
        }
        if( methods ){
            description.push(`'methods':${methods}`);
        }
        if( members ){
            description.push(`'members':${members}`);
        }
        return description;
    }

    createDefaultConstructor(module, inherit, properties, initialProps){
        const defaultConstructor=[`function (options){`];
        if( properties.length > 0 ){
            defaultConstructor.push( this.semicolon(`\tObject.defineProperty(this,${this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)},{value:{${properties.join(",")}}})`) )
        }
        if( inherit ){
            defaultConstructor.push( this.semicolon(`${this.getModuleReferenceName(inherit)}.prototype._init.call(this,options)`) );
        }
        if( initialProps.length > 0 ){
            defaultConstructor.push.apply(defaultConstructor, initialProps);
        }
        defaultConstructor.push('}');
        return defaultConstructor.join("\r\n");
    }

    createOptions(name,inherit,props,data){
        const properties = [`name:'${name}'`];
        const indent = this.getIndent();
        if( inherit ){
            properties.push( `extends:${this.getModuleReferenceName(inherit)}` );
        }
        if( props.length > 0 ){
            properties.push( `props:{\r\n\t\t${indent}${props.join(`,\r\n\t\t${indent}`)}\r\n\t${indent}}` );
        }
        if( data.length > 0 ){
            properties.push( `data:function data(){return {\r\n\t\t${indent}${data.join(`,\r\n\t\t${indent}`)}\r\n\t${indent}};}` );
        }
        return `{\r\n\t${indent}${properties.join(`,\r\n\t${indent}`)}\r\n}`;
    }

}


module.exports = VueClass;