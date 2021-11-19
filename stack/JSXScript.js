const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class JSXScript extends Syntax{

    emitStack(item,name,isStatic,properties,modifier){
        if( !item )return null;
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

    emitter( render , initProperties){
        const module = this.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const content = [];
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

        const topRefs = new Map();
        // const classScope = this.stack.scope.getScopeByType("class");
        // const topRefs = new Map();
        // classScope.removeAllListeners("insertTopRefsToClassBefore");
        // classScope.addListener("insertTopRefsToClassBefore",(object)=>{
        //     topRefs.set(object.name,object.value);
        // });

        this.addDepend( this.getGlobalModuleById('Class') );
        emitter( methods , 'methods', methodContent , true);
        emitter( members , `members`, memberContent , false);

        if( render && typeof render === 'function' ){
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

        const parentClassName = module.extends.length > 0 ? module.getReferenceNameByModule( module.extends[0] ) : 'Object';
        const callSuper = module.extends.length > 0 ? `\t${parentClassName}.call(this)` : '';
        const defaultConstructor=[`function ${module.id}(){`];

        if( properties.length > 0 ){
            if( module.methodConstructor ){
                module.methodConstructor.once("fetchClassProperty",(event)=>{
                    event.properties = `{${properties.join(",")}}`;
                });
            }else{
                defaultConstructor.push( this.semicolon(`\tObject.defineProperty(this,${this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)},{value:{${properties.join(",")}}})`) )
            }
        }
        if( callSuper ){
            defaultConstructor.push( this.semicolon( callSuper) );
        }
        if( initProperties && initProperties.length > 0){
            if( module.methodConstructor ){
                module.methodConstructor.once("fetchClassInitProperties",(event)=>{
                    event.properties = initProperties;
                });
            }
            defaultConstructor.push( initProperties.map( item=>this.semicolon(`\t${item}`) ).join('\r\n') );
        }
        defaultConstructor.push('}');

        const construct = module.methodConstructor ? this.make(module.methodConstructor) : `${defaultConstructor.join("\r\n")}`;
        const description = [
            `'id':${Constant.DECLARE_CLASS}`,
            `'ns':'${module.namespace.toString()}'`,
            `'name':'${module.id}'`,
            `'private':${Constant.REFS_DECLARE_PRIVATE_NAME}`,
        ];

        if( inherit ){
            description.push(`'inherit':${module.getReferenceNameByModule(inherit)}`);
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
        parts.push( this.emitCreateClassDescription( module, description) );
        parts.push( this.emitExportClass(module) );
        return parts.join("\r\n");
    }

}

module.exports = JSXScript;