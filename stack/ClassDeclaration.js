const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class ClassDeclaration extends Syntax{

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

    emitter(){
        const module = this.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const content = [];
        const imps    = this.getImps(module);
        const inherit = this.getInherit(module);
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
        const methodContent = [];
        const memberContent = [];

        const classScope = this.stack.scope.getScopeByType("class");
        const topRefs = new Map();
        classScope.removeAllListeners("insertTopRefsToClassBefore");
        classScope.addListener("insertTopRefsToClassBefore",(object)=>{
            topRefs.set(object.name,object.value);
        });

        this.addDepend( this.getGlobalModuleById('Class') );
        emitter( methods , 'methods', methodContent , true);
        emitter( members , `members`, memberContent , false);

        const iteratorType = this.getGlobalModuleById("Iterator")
        if( module.implements.includes(iteratorType) ){
            memberContent.push(`members[Symbol.iterator]={value:function(){return this;}}`)
        }

        const parentClassName = inherit ? this.getModuleReferenceName( inherit ) : 'Object';
        const callSuper = inherit ? `${parentClassName}.call(this);` : '';
        const defaultConstructor=[`function ${module.id}(){`];

        if( properties.length > 0 ){
            module.methodConstructor.once("fetchClassProperty",(event)=>{
                event.properties = `{${properties.join(",")}}`;
            });
            defaultConstructor.push( this.semicolon(`\tObject.defineProperty(this,${this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)},{value:{${properties.join(",")}}})`) )
        }
        if( callSuper ){
            defaultConstructor.push( this.semicolon( callSuper) );
        }
        defaultConstructor.push('}');

        const construct = module.methodConstructor ? this.make(module.methodConstructor) : `${defaultConstructor.join("\r\n")}`;
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
            description.push(`'inherit':${this.getModuleReferenceName( inherit )}`);
        }

        this.createDependencies(module,refs);
        refs.push(`var ${Constant.REFS_DECLARE_PRIVATE_NAME}=Symbol("private");`);
        
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

        const parts = refs.concat(construct,content);
        const external = this.buildExternal();
        parts.push( this.emitCreateClassDescription( module, description) );

        if( inherit && this.isInheritWebComponent(module) ){
            if( this.getConfig('webComponent') ==="vue" ){
                parts.push( this.emitVueCreateClass(module, inherit, props, data) );
            }
        }

        parts.push( this.emitExportClass(module) );
        if( external ){
            parts.push( external );
        }

        return parts.join("\r\n");
    }
}

module.exports = ClassDeclaration;