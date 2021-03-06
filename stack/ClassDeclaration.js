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
        const _private = this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
        const properties = [];
        const content = [];
        const imps    = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [];
        const mainEnterMethods=[];
        const emitter=(target,proto,content,isStatic,descriptive)=>{
            for( var name in target ){
                const item = target[ name ];
                const modifier = item.modifier ? item.modifier.value() : 'public';
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
                        descriptive
                    ));
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
                        descriptive
                    ));
                }else{

                    if(isStatic && modifier ==="public" && item.isEnterMethod && !mainEnterMethods.length ){
                        mainEnterMethods.push( this.semicolon(`${module.id}.${name}()`) )
                    }

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

        if( module.methodConstructor && properties.length > 0 ){
            module.methodConstructor.once("fetchClassProperty",(event)=>{
                event.properties = `{${properties.join(",")}}`;
            });
        }
       
        const construct = module.methodConstructor ? this.make(module.methodConstructor) : this.createDefaultConstructor(module,inherit,_private,properties);
        
        this.createDependencies(module,refs);
        refs.push(`var ${_private}=Symbol("private");`);
        
        //alias refs
        if( topRefs.size > 0 ){
            topRefs.forEach( (value,name)=>{
                refs.push( `var ${value} = ${name};` );
            });
        }

        let _methods = null;
        let _members = null;

        if( methodContent.length > 0 ){
            content.push(`var methods = {};`);
            content.push( methodContent.join("\r\n") )
            _methods='methods';
        }

        if( memberContent.length > 0 ){
            content.push(`var members = {};`);
            content.push( memberContent.join("\r\n") )
            _members='members';
        }

        const description = this.createClassDescription(module, inherit, imps, _methods, _members, _private );
        const parts = refs.concat(construct,content);
        const external = this.buildExternal();
        parts.push( this.emitCreateClassDescription( module, description) );
        parts.push( this.emitExportClass(module) );
        if( external ){
            parts.push( external );
        }
        if( mainEnterMethods.length > 0 ){
            parts.push( mainEnterMethods.join('\r\n') );
        }
        return parts.join("\r\n");
    }

    createClassDescription(module, inherit, imps, methods, members, _private){
        const description = [
            `'id':${Constant.DECLARE_CLASS}`,
            `'ns':'${module.namespace.toString()}'`,
            `'name':'${module.id}'`,
        ];
        if( module.dynamic ){
            description.push(`'dynamic':true`);
        }
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

    createDefaultConstructor(module, inherit, _private, properties, initialProps){
        const defaultConstructor=[`function ${module.id}(){`];
        if( properties.length > 0 ){
            defaultConstructor.push( this.semicolon(`\tObject.defineProperty(this,${_private},{value:{${properties.join(",")}}})`) )
        }
        if( inherit ){
            defaultConstructor.push( this.semicolon(`${this.getModuleReferenceName(inherit)}.apply(this,Array.prototype.slice.call(arguments))`) );
        }
        if(initialProps && initialProps.length > 0 ){
            defaultConstructor.push.apply(defaultConstructor, initialProps);
        }
        defaultConstructor.push('}');
        return defaultConstructor.join("\r\n");
    }
}

module.exports = ClassDeclaration;