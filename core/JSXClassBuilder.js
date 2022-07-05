const Token = require("./Token");
const Constant = require("./Constant");
const ClassDeclaration = require("../transforms/ClassDeclaration")
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
        const content = [];

        const classNode = this.createNode('ClassDeclaration');
        classNode.id = this.createIdentifierNode( module.id );
        classNode.implements = module.implements.filter( impModule=>{
            return !impModule.isDeclaratorModule && impModule.isInterface;
        });
        classNode.body = [];

        if( this.isActiveForModule(module.inherit) ){
            classNode.inherit = module.inherit;
            node.addDepend(module.inherit);
        }
    
        const reserved = this.getReserved();
        const Component = this.builder.getGlobalModuleById('web.components.Component');
        this.addDepend( Component );
        
        const methodObject = this.createMemberNode(methods, true);
        const memberObject = this.createMemberNode(members, false);
        classNode.initProvider = memberObject.initProvider;
        classNode.initProperties = initProperties ? initProperties.concat(memberObject.injectProperties) : memberObject.injectProperties;
        classNode.privateProperties = memberObject.privateProperties;
        classNode.construct = module.methodConstructor ? this.createToken( module.methodConstructor ) : memberObject.construct;

        const iteratorType = this.builder.getGlobalModuleById("Iterator")
        if( module.implements.includes(iteratorType) ){
            const method = this.createMethodNode( 'Symbol.iterator', (ctx)=>{
                const obj = this.createNode('ReturnStatement'); 
                obj.argument = obj.createThisNode();
                ctx.body.push( obj );
            });
            method.static = false;
            method.modifier = 'public';
            method.kind = 'method';
            method.key.computed = true;
            memberObject.items.push( method );
        }

        if( render ){
            memberObject.items.push( render );
        }

        this.addDepend( this.getGlobalModuleById('Class') );
        ClassDeclaration.createStatementMember(this, 'methods', methodObject.items);
        ClassDeclaration.createStatementMember(this, 'members', memberObject.items);

        if( classNode.privateProperties.length ){
            classNode.privateName = this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
            classNode.beforeBody.push( classNode.createDeclarationNode(
                'const',
                [
                    this.createDeclaratorNode(
                        classNode.privateName,
                        this.createCalleeNode( 
                            this.createIdentifierNode('Symbol'),
                            [this.createLiteralNode('private')]
                        )
                    )
                ]
            ));
        }

        if( classNode.construct ){
            let index = classNode.construct.body.body.findIndex( item=>{
                if( item.type ==='ExpressionStatement' && item.expression.type==="CallExpression" ){
                    return item.expression.callee.object.type==="SuperExpression";
                }
                return false;
            });
            if( classNode.privateProperties.length ){
                classNode.construct.body.body.splice(index++, 0, ClassDeclaration.createConstructInitPrivateObject(classNode, classNode.privateName, classNode.privateProperties) );
            }
            if( classNode.initProperties.length ){
                classNode.initProperties.forEach( item=>{
                    classNode.construct.body.body.splice(index++, 0, item);
                });
            }
        }else{
            classNode.construct = ClassDeclaration.createDefaultConstructMethod(classNode, module, classNode.privateProperties, classNode.initProperties);
        }
    
        if( construct ){
            const callParams = ['this', 'options'];
            const callConstructor = [];
            const injectAndProvide = memberObject.injectProperties.concat( memberObject.initProvider );
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