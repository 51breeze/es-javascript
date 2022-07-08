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
        return null;
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

    createClassMemberNode(dataset, isStatic){

        const refs = [];
        const cache = new Map();
        const privateProperties = [];
        var construct = null;

        const injectProperties = [];
        const provideProperties = [];
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
                provideProperties.push(  this.createAddProviderNode(name) );
            }
        }

        const reserved = this.getReserved();

        for( var name in dataset ){
            var item = dataset[ name ];
            if( Array.isArray(reserved) && reserved.includes( name ) ){
                item.error(1124,name);
            }

            if( item.isAccessor ){
                var target={isAccessor:true,kind:'accessor'};
                if( item.get ){
                    target.get = this.createToken( item.get );
                }
                
                if( item.set  ){
                    const required = item.set.annotations && item.set.annotations.find( annotation=>annotation.name.toLowerCase() ==='required' );
                    const injector = item.set.annotations && item.set.annotations.find( annotation=>annotation.name.toLowerCase() ==='injector' );
                    injectorPush(injector, name);
                    target.set = this.createToken( item.set );
                    target.set.required = required;
                }
                const obj = (target.get || target.set);
                target.kind = obj.kind;
                target.modifier = obj.modifier;
                target.static = obj.static;
                target.key = obj.key;
                refs.push( target );
                continue;
            }

            const required = item.annotations && item.annotations.find( annotation=>annotation.name.toLowerCase() ==='required' );
            const provider = item.annotations && item.annotations.find( annotation=>annotation.name.toLowerCase() ==='provider' );
            const injector = item.annotations && item.annotations.find( annotation=>annotation.name.toLowerCase() ==='injector' );
            var child = this.createToken(item);
            const _static = !!(item.static || isStatic);

            if( child.type ==="PropertyDefinition" ){
                if( !child.init ){
                    child.init = child.createLiteralNode(null);
                }

                if( !_static ){
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
                        target.kind = 'get';
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
                if( !_static && item.isMethodDefinition ){
                    providerPush( provider, child.key.value);
                }
                refs.push( child );
            }
        }
        return {items:refs,construct,privateProperties, injectProperties, provideProperties};
    }

    createClassNode( initProperties = []){

        const module = this.module;
        const methods = module.methods;
        const members = module.members;
       
        const node = this.createNode('ClassDeclaration');
        node.beforeBody = [];
        node.afterBody = [];
        node.body = [];
        node.id = this.createIdentifierNode( module.id );
        node.implements = module.implements.filter( impModule=>{
            return !impModule.isDeclaratorModule && impModule.isInterface;
        });
        if( this.isActiveForModule(module.inherit) ){
            node.inherit = module.inherit;
            this.addDepend(module.inherit);
        }

        const methodObject = this.createClassMemberNode(methods, true);
        const memberObject = this.createClassMemberNode(members, false);

        node.methods = methodObject.items;
        node.members = memberObject.items;
        node.initProperties = initProperties;
        node.provideProperties = memberObject.provideProperties;
        node.injectProperties = memberObject.injectProperties;
        node.privateProperties = memberObject.privateProperties;
        var construct = module.methodConstructor ? this.createToken( module.methodConstructor ) : memberObject.construct;
        
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
            node.members.push( method );
        }

        this.addDepend( this.builder.getGlobalModuleById('Class') );
       
        if( node.privateProperties.length ){
            node.privateName = this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
            node.beforeBody.push( node.createDeclarationNode(
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

        if( construct ){
            let index = construct.body.body.findIndex( item=>{
                if( item.type ==='ExpressionStatement' && item.expression.type==="CallExpression" ){
                    return item.expression.callee.object.type==="SuperExpression";
                }
                return false;
            });
            if( node.privateProperties.length ){
                construct.body.body.splice(index++, 0, this.createConstructInitPrivateObject(node, node.privateName, node.privateProperties) );
            }
            const initProperties = node.initProperties;
            if( initProperties.length ){
                initProperties.forEach( item=>{
                    construct.body.body.splice(index++, 0, item);
                });
            }
        }else if( node.privateProperties.length >0 || node.initProperties.length >0){
            construct = this.createDefaultConstructMethod(node, module, node.privateProperties, node.initProperties );
        }
        node.construct = construct;
        this.adjustConstructor(node, module);
        return node;
    }

    createDefaultConstructMethod(node, module, privateProperties, initProperties, params=[]){
        return ClassDeclaration.createDefaultConstructMethod(node, module, privateProperties, initProperties, params );
    }

    createConstructInitPrivateObject(node, privateName, privateProperties){
        return ClassDeclaration.createConstructInitPrivateObject(node, privateName, privateProperties)
    }

    adjustConstructor(node, module){
        const injectAndProvide = node.injectProperties.concat( node.provideProperties );
        const initBody = [];
        if( injectAndProvide.length > 0 ){
            initBody.push(
                this.createStatementNode(
                    this.createCalleeNode(
                        this.createMemberNode([
                            this.createThisNode(),
                            this.createIdentifierNode('addEventListener')
                        ]),
                        [
                            this.createLiteralNode('onBeforeCreate'),
                            this.createCalleeNode(
                                this.createMemberNode([
                                    this.createParenthesNode(
                                        this.createFunctionNode((ctx)=>{
                                            ctx.body = injectAndProvide;
                                        },[this.createIdentifierNode('e')])
                                    ),
                                    this.createIdentifierNode('bind')
                                ]),
                                [
                                    this.createThisNode()
                                ]
                            )
                        ]
                    )
                )
            );
        }
        
        if( node.construct ){
            initBody.push( 
                this.createStatementNode(
                    this.createCalleeNode(
                        this.createMemberNode([
                            this.createParenthesNode( node.construct ),
                            this.createIdentifierNode('call')
                        ]),
                        [
                            this.createThisNode(),
                            this.createIdentifierNode('options')
                        ]
                    )
                )
            );
        }

        if( initBody.length > 0 ){

            if( !node.construct && module.inherit ){
                initBody.push(
                    this.createStatementNode(
                        this.createCalleeNode(
                            this.createMemberNode([
                                this.getModuleReferenceName(module.inherit, module),
                                this.createIdentifierNode('prototype'),
                                this.createIdentifierNode('_init'),
                                this.createIdentifierNode('call')
                            ]),
                            [
                                this.createThisNode(),
                                this.createIdentifierNode('options')
                            ]
                        )
                    )
                );
            }

            const initMethod = this.createMethodNode('_init',ctx=>{
                    ctx.body = initBody;
                },
                [this.createIdentifierNode('options')]
            );
            initMethod.kind = 'method';
            initMethod.modifier = 'public';
            initMethod.static = false;
            node.members.splice(0,0,initMethod);
        }

        const Component = this.builder.getGlobalModuleById('web.components.Component');
        this.addDepend( Component );

        node.construct = this.createDeclarationNode('const',[
            this.createDeclaratorNode(
                this.createIdentifierNode(module.id),
                this.createCalleeNode(
                    this.createMemberNode([
                        this.createIdentifierNode( this.getModuleReferenceName(Component, module) ),
                        this.createIdentifierNode('createComponent')
                    ]),
                    [
                        this.createOptionNode(module.id, node.inherit)
                    ]
                )
            )
        ]);
    }

    createOptionNode(name,inherit){
        const properties = [
            this.createPropertyNode(this.createIdentifierNode('name'), this.createLiteralNode(`es-${name}`) )
        ];
        if( inherit ){
            const Component = this.builder.getGlobalModuleById('web.components.Component');
            if( Component !== inherit ){
                properties.push( this.createPropertyNode(this.createIdentifierNode('extends'), this.getModuleReferenceName(inherit) ) );
            }
        }
        return this.createObjectNode( properties );
    }
    
    create( render, initProperties=[], convert=null){

        const module = this.module;
        var classNode = null;
        if( this.compilation.JSX ){
            classNode = this.createClassNode(initProperties);
        }else{
            classNode = ClassDeclaration.createClassNode(this, this.stack, this.stack.toString() ,convert || ((child, node, stack)=>{
                if( !child.static && child.type ==="PropertyDefinition" && child.modifier === "public" && child.kind ==="var" ){  
                    const target ={
                        get:this.createGetterNode(child.key.value, child.init, child.required),
                        set:this.createSetterNode(child.key.value, child.required),
                        modifier:child.modifier,
                        isAccessor:true
                    }
                    target.key = target.get.key;
                    target.kind = 'get';
                    return target;    
                }
                return child;
            }), false);
            this.adjustConstructor(classNode, module);
        }

        const body = classNode.body;
        if( render ){
            classNode.members.push( render );
        }

        ClassDeclaration.createDependencies(classNode, module).forEach( item=>body.push( item ) );
        ClassDeclaration.createModuleAssets(classNode, module).forEach( item=>body.push( item ) );

        classNode.beforeBody.forEach( item=>item && body.push( item ) );

        body.push( classNode.construct );
        body.push( ClassDeclaration.createStatementMember(this, 'methods', classNode.methods) );
        body.push( ClassDeclaration.createStatementMember(this, 'members', classNode.members) );

        body.push( ClassDeclaration.createClassDescriptor(
            classNode, 
            module, 
            classNode.privateName,
            classNode.methods,
            classNode.members,
            classNode.implements,
            classNode.inherit
        ));

        classNode.afterBody.forEach( item=>item && body.push( item ) );
        body.push( ClassDeclaration.createExportDeclaration(classNode, module.id) );
        return classNode;
    }

}

module.exports = JSXClassBuilder;