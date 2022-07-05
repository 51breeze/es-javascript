const Token = require("./Token");
class JSXClassBuilder extends Token{
    constructor(stack, ctx){
        super(stack.toString());
        this.stack = stack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.compiler = stack.compiler;
        this.module =  stack.module;
        this.plugin = ctx.plugin;
        this.name = ctx.name;
        this.platform = ctx.platform;
        this.parent = ctx;
        this.builder = ctx.builder;
    }

    getReserved(){
        return this.builder.getConfig('reserved') || [];
    }

    createInjectPropertyNode(name,from,value){
        const args = [
            this.createLiteralNode(name),
            this.createLiteralNode(from)
        ];

        if( value ){
            args.push( this.createLiteralNode(value) );
        }
        return this.createStatementNode(
            this.createCalleeNode(
                this.createMemberNode([
                    this.createThisNode(),
                    this.createIdentifierNode('injectProperty')
                ]),
                args
            )
        );
    }

    createAddProviderNode(name){
        return this.createStatementNode(
            this.createCalleeNode(
                this.createMemberNode([
                    this.createThisNode(),
                    this.createIdentifierNode('addProvider')
                ]),
                [
                    this.createCalleeNode( 
                        this.createMemberNode([
                            this.createThisNode(),
                            this.createIdentifierNode(name),
                            this.createIdentifierNode('bind')
                        ]), 
                        [
                            this.createThisNode()
                        ]
                    )
                ]
            )
        );
    }

    createGetterNode(name, value, required){
        const args = [
            this.createLiteralNode(name)
        ];
        if( value ){
            args.push( this.createChunkNode('void 0', false) )
            args.push( this.createFunctionNode(ctx=>{
                ctx.body=[ctx.createReturnNode(value)]
            }));
        }
        const node = this.createMethodNode(name,ctx=>{
            ctx.body=[
                ctx.createReturnNode( 
                    ctx.createCalleeNode( 
                        ctx.createMemberNode([
                            ctx.createThisNode(),
                            ctx.createIdentifierNode('reactive')
                        ]),
                        args
                    )
                )
            ];
        });
        node.kind = 'get';
        node.isAccessor = true;
        node.required = required;
        return node;
    }

    createSetterNode(name, required){
        const node = this.createMethodNode(name,ctx=>{
            ctx.body=[
                ctx.createStatementNode( 
                    ctx.createCalleeNode( 
                        ctx.createMemberNode([
                            ctx.createThisNode(),
                            ctx.createIdentifierNode('reactive')
                        ]),
                        [
                            this.createLiteralNode(name),
                            this.createIdentifierNode('value')
                        ]
                    )
                )
            ];
        },[ this.createIdentifierNode('value') ]);
        node.kind = 'set';
        node.isAccessor = true;
        node.required = required;
        return node;
    }

    createMemberNode(target, isStatic){
        const refs = [];
        const cache = new Map();
        const privateProperties = [];
        var construct = null;

        const injectProperties = [];
        const initProvider = [];
        const injectorPush=(injector, name, value)=>{
            if( injector ){
                const injectorArgs = injector.getArguments();
                var from = name;
                if( injectorArgs.length > 0 ){
                    from = injectorArgs[0].value || from;
                }
                injectProperties.push( this.createInjectPropertyNode(name,from, value) ); 
            }
        }

        const providerPush=(provider, name)=>{
            if( provider ){
                initProvider.push( this.createAddProviderNode(name) );
            }
        }

        for( var name in target ){
            const item = target[ name ];
            const required = item.annotations && item.annotations.find( annotation=>annotation.name.toLowerCase() ==='required' );
            const provider = item.annotations && item.annotations.find( annotation=>annotation.name.toLowerCase() ==='provider' );
            const injector = item.annotations && item.annotations.find( annotation=>annotation.name.toLowerCase() ==='injector' );
            if( Array.isArray(reserved) && reserved.includes(name) ){
                item.error(1124,name);
            }

            var child = this.createToken(item);
            const static = !!(item.static || isStatic);

            if( child.type ==="PropertyDefinition" ){
                if( !static ){
                    if( child.modifier === "private" ){
                        privateProperties.push(
                            ctx.createPropertyNode( child.key.value, child.init )
                        );
                    }else if( child.modifier === "public" && item.kind ==="var" ){
                        injectorPush( injector, child.key.value, child.value );
                        const target ={
                            get:this.createGetterNode(child.key.value, child.init, required),
                            set:this.createSetterNode(child.key.value, required),
                            modifier:child.modifier,
                            isAccessor:true
                        }
                        target.key = target.get.key;
                        child = target;
                    }
                }
            }

            if( item.isMethodSetterDefinition || item.isMethodGetterDefinition ){
                const name = child.key.value;
                var target = cache.get( name );
                if( !target ){
                    target={isAccessor:true,kind:child.kind, key:child.key, modifier:child.modifier};
                    cache.set(name, target);
                    refs.push( target );
                }
                if( item.isMethodGetterDefinition ){
                    target.get =child;
                }else if( item.isMethodSetterDefinition ){
                    injectorPush(injector, name);
                    target.set = child;
                }
                child.required = required;
            }else if(item.isConstructor && item.isMethodDefinition){
                construct = child;
            }
            else{
                if( item.isMethodDefinition ){
                    providerPush( provider, child.key.value);
                }
                refs.push( child );
            }
        }
        return {items:refs,construct,privateProperties, injectProperties, initProvider};
    }
    
    create( render, initProperties){
        const module = this.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const initialProps = initProperties && initProperties.length > 0 ? initProperties.map( item=>this.semicolon(`\t${item}`) ).join('\r\n') : [];
        const content = [];
        const imps = module.implements.filter( impModule=>{
            return !impModule.isDeclaratorModule && impModule.isInterface;
        });

        var inherit = null;
        if( this.isActiveForModule(module.inherit) ){
            node.inherit = module.inherit;
            node.addDepend(module.inherit);
        }
    
        const reserved = this.getReserved();
        const methodContent = [];
        const memberContent = [];
        const mainEnterMethods = [];
        const Component = this.builder.getGlobalModuleById('web.components.Component');
        this.addDepend( Component );
        
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

        this.createMemberNode(methods, true);
        this.createMemberNode(members, false);

        this.addDepend( this.getGlobalModuleById('Class') );

        const iteratorType = this.getGlobalModuleById("Iterator")
        if( module.implements.includes(iteratorType) ){
            memberContent.push(`members[Symbol.iterator]={value:function(){return this;}}`)
        }

       

        let construct = module.methodConstructor ? this.make(module.methodConstructor) : null;
        if( !construct && (properties.length > 0 || initialProps.length > 0 || injectProperties.length > 0 || providerMethod.length > 0 ) ){
            construct =  this.createDefaultConstructor(module, inherit, properties, initialProps);
        }

        if( construct ){
            const callParams = ['this', 'options'];
            const callConstructor = [];
            const injectAndProvide = injectProperties.concat( providerMethod );
            if( injectAndProvide.length > 0 ){
                callConstructor.push(this.semicolon(`this.addEventListener('onBeforeCreate',(function(e){${injectProperties.concat( providerMethod ).join('\r\n')}}).bind(this))`));
            }
            callConstructor.push( this.semicolon(`(${construct}).call(${callParams.join(',')})`) );
            memberContent.push(`members._init={value:function _init(options){\r\n${callConstructor.join('\r\n')}\r\n}}`)
        }

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

        this.createDependencies(module,refs);

        const _private = properties.length > 0 ? Constant.REFS_DECLARE_PRIVATE_NAME : null;
        if( _private ){
            refs.push(`var ${_private}=Symbol("private");`);
        }
        
        //alias refs
        if( topRefs.size > 0 ){
            topRefs.forEach( (value,name)=>{
                refs.push( `var ${value} = ${name};` );
            });
        }

        const createConstructor = this.semicolon(`var ${module.id} = ${this.getModuleReferenceName(Component, module)}.createComponent(${this.createOptions(module.id,inherit)})`);
        const description = this.createClassDescription(module, inherit, imps, _methods, _members, _private);
        const parts = refs.concat(content,createConstructor);
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


    createOptions(name,inherit){
        const properties = [`name:'es-${name}'`];
        const indent = this.getIndent();
        if( inherit ){
            const Component = this.getGlobalModuleById('web.components.Component');
            if( Component !== inherit ){
                properties.push( `extends:${this.getModuleReferenceName(inherit)}` );
            }
        }
        return `{\r\n\t${indent}${properties.join(`,\r\n\t${indent}`)}\r\n}`;
    }

}


module.exports = JSXClassBuilder;