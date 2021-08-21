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
                    properties.push(`"${name}":${value||null}`);
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

        emitter( methods , 'methods', methodContent , true);
        emitter( members , `members`, memberContent , false);

        const iteratorType = this.stack.getGlobalTypeById("Iterator")
        if( module.implements.includes(iteratorType) ){
            memberContent.push(`members[Symbol.iterator]={value:function(){return this;}}`)
        }

        const parentClassName = module.extends.length > 0 ? module.getReferenceNameByModule( module.extends[0] ) : 'Object';
        const callSuper = module.extends.length > 0 ? `${parentClassName}.call(this);` : '';
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
            `id:${Constant.DECLARE_CLASS}`,
            `ns:"${module.namespace.toString()}"`,
            `name:"${module.id}"`,
            `private:${Constant.REFS_DECLARE_PRIVATE_NAME}`,
        ];

        if( imps.length > 0 ){
            description.push(`imps:[${imps.map(item=>module.getReferenceNameByModule(item)).join(",")}]`);
        }
        if( inherit ){
            description.push(`inherit:${module.getReferenceNameByModule(inherit)}`);
        }

        this.addDepend( this.compilation.getModuleById("System") );

        this.createDependencies(module,refs);
        refs.push(`var ${Constant.REFS_DECLARE_PRIVATE_NAME}=Symbol("private");`);
        if( topRefs.size > 0 ){
            topRefs.forEach( (value,name)=>{
                if(name==="System"){
                    refs.push( `var ${value} = System;` );
                }else if(name === Constant.REFS_DECLARE_PRIVATE_NAME){
                    refs.push( `var ${value} = ${Constant.REFS_DECLARE_PRIVATE_NAME};` );
                }
            });
        }

        if( methodContent.length > 0 ){
            content.push(`var methods = {};`);
            description.push(`methods:methods`);
            content.push( methodContent.join("\r\n") )
        }

        if( memberContent.length > 0 ){
            content.push(`var members = {};`);
            description.push(`members:members`);
            content.push( memberContent.join("\r\n") )
        }

        const config  = this.getConfig();
        const parts = refs.concat(construct,content);
        parts.push(`System.setClass(${this.getIdByModule(module)},${module.id},${this.getDescription(description)});`);
        const external = this.buildExternal();
        if( config.output.mode === Constant.BUILD_OUTPUT_MERGE_FILE ){
            const moduleContent = [
                `/*class ${module.getName()}*/`, 
                `(function(System){\r\n\t${parts.join("\r\n").replace(/\r\n/g,'\r\n\t')}\r\n}(System));`
            ];
            if( external ){
                moduleContent.push( external );
            }
            return moduleContent.join("\r\n");
        }else{
            if( external ){
                parts.push( external );
            }
            if( config.module === Constant.BUILD_REFS_MODULE_ES6 ){
                parts.push(`export default ${this.module.id};`)
            }else{
                parts.push(`module.exports=${this.module.id};`)
            }
            return parts.join("\r\n");
        }
    }
}

module.exports = ClassDeclaration;