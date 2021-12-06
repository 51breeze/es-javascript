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
        const initialProps = [];
        const content = [];
        const imps    = this.getImps(module);
        let inherit = this.getInherit(module);
        const refs = [];
        const props = [];
        const data = [];
        const isWeb = this.getConfig('webComponent') ==='vue' && this.isInheritWebComponent( module );
        const reserved = isWeb ? this.getConfig('reserved') : [];
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

        if( !inherit && isWeb ){
            inherit = this.getGlobalModuleById('web.components.Component');
            this.addDepend( inherit );
        }

        const methodContent = [];
        const memberContent = [];

        const classScope = this.stack.scope.getScopeByType("class");
        const topRefs = new Map();
        classScope.removeAllListeners("insertTopRefsToClassBefore");
        classScope.addListener("insertTopRefsToClassBefore",(object)=>{
            topRefs.set(object.name,object.value);
        });

        const Vue = this.getGlobalModuleById('web.Vue');
        this.addDepend( Vue );
        this.addDepend( this.getGlobalModuleById('Class') );

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
        if( module.implements.includes(iteratorType) ){
            memberContent.push(`members[Symbol.iterator]={value:function(){return this;}}`)
        }

        const parentClassName = inherit ? this.getModuleReferenceName( inherit ) : 'Object';
        
        const callSuper = inherit ? `${module.id}.options.extends.prototype._init.call(this,options)` : '';
       
        const defaultConstructor=[`function (options){`];
        if( properties.length > 0 ){
            defaultConstructor.push( this.semicolon(`\tObject.defineProperty(this,${this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)},{value:{${properties.join(",")}}})`) )
        }

        if( callSuper ){
            defaultConstructor.push( this.semicolon( callSuper) );
        }

        if( initProperties && initProperties.length > 0){
            initialProps.unshift( initProperties.map( item=>this.semicolon(`\t${item}`) ).join('\r\n') );
        }

        if( initialProps.length > 0 ){
            defaultConstructor.push( initialProps.join("\r\n") );
        }

        defaultConstructor.push('}');

        if( module.methodConstructor ){
            module.methodConstructor.once("fetchClassProperty",(event)=>{
                event.properties = `{${properties.join(",")}}`;
                event.initialProps = initialProps.join("\r\n");
            });
        }

        const construct = module.methodConstructor ? this.make(module.methodConstructor) : `${defaultConstructor.join("\r\n")}`;
       
        const callConstructor = [
            this.semicolon(`(${construct}).call(this,options)`),
            //this.semicolon(`${this.getModuleReferenceName(Vue, module)}.prototype._init.call(this,options)`)
        ]
        memberContent.push(`members._init={value:function _init(options){\r\n${callConstructor.join('\r\n')}\r\n}}`)

        const description = [
            `'id':${Constant.DECLARE_CLASS}`,
            `'ns':'${module.namespace.toString()}'`,
            `'name':'${module.id}'`,
            `'private':${Constant.REFS_DECLARE_PRIVATE_NAME}`,
        ];

        if( imps.length > 0 ){
            description.push(`'imps':[${imps.map(item=>this.getModuleReferenceName(item)).join(",")}]`);
        }

        if( inherit ){
            if( inherit.isDeclaratorModule && this.isInheritWebComponent( inherit ) ){
                description.push(`'inherit':${module.id}.options.extends`);
            }else{
                description.push(`'inherit':${this.getModuleReferenceName(inherit)}`);
            }
        }

        const createConstructor = this.semicolon(`var ${module.id} = ${this.getModuleReferenceName(Vue, module)}.extend(${this.createVueOptions(module.id,inherit,props,data)})`);
        refs.push(`var ${Constant.REFS_DECLARE_PRIVATE_NAME}=Symbol("private");`);
       
        this.createDependencies(module,refs);
        
        //alias refs
        if( topRefs.size > 0 ){
            topRefs.forEach( (value,name)=>{
                refs.push( `var ${value} = ${name};` );
            });
        }

        if( methodContent.length > 0 ){
            content.push(`var methods = {};`);
            description.push(`'methods':methods`);
            content.push( methodContent.join("\r\n") )
        }

        if( memberContent.length > 0 ){
            content.push(`var members = {};`);
            description.push(`'members':members`);
            content.push( memberContent.join("\r\n") )
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

    createVueOptions(name,inherit,props,data){
        const properties = [`name:'${name}'`];
        const indent = this.getIndent();
        if( inherit ){
            if( inherit.isDeclaratorModule && this.isInheritWebComponent( inherit ) ){
                const Component = this.getGlobalModuleById('web.components.Component');
                this.addDepend( Component );
                const _inherit = `Class.property(${this.getModuleReferenceName(Component)},'inherit').call(null,${this.getModuleReferenceName(inherit)})`;
                properties.push( `extends:${_inherit}` )
            }else{
                properties.push( `extends:${this.getModuleReferenceName(inherit)}` );
            }
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