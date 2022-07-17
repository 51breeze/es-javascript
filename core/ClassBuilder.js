const Constant = require("../core/Constant");
const Token = require("./Token");
const MODIFIER_MAP={
    "public":Constant.MODIFIER_PUBLIC,
    "protected":Constant.MODIFIER_PROTECTED,
    "private":Constant.MODIFIER_PRIVATE,
}

const IDENT_MAP={
    "accessor":Constant.DECLARE_PROPERTY_ACCESSOR,
    "var":Constant.DECLARE_PROPERTY_VAR,
    "const":Constant.DECLARE_PROPERTY_CONST,
    "method":Constant.DECLARE_PROPERTY_FUN,
};

class ClassBuilder extends Token{

    static createClassNode(stack, ctx, type){
        const obj = new ClassBuilder(stack, ctx, type);
        return obj.create();
    }

    constructor(stack, ctx, type){
        super(type || stack.toString());
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
        this.privateProperties=[];
        this.initProperties=[];
        this.injectProperties = [];
        this.provideProperties = [];
        this.beforeBody = [];
        this.afterBody = [];
        this.methods = [];
        this.members = [];
        this.construct = null;
        this.body = [];
        this.implements = [];
        this.inherit = null;
        this.privateSymbolNode = null;
        this.addListener('onCreateRefsName',(event)=>{
            if( event.name === Constant.REFS_DECLARE_PRIVATE_NAME && event.top===true ){
                event.prevent = true;
                this.privateSymbolNode = this.createPrivateSymbolNode(event.value);
            }
        });
    }

    create(){
        const module = this.module;
        const body = this.body;
        const multiModule = this.stack.compilation.modules.size > 1;
        var mainModule = module;
        if( multiModule && stack.compilation.modules.size > 1){
            mainModule = Array.from( stack.compilation.modules.values() )[0];
        }
        this.createClassStructuralBody();
        this.createDependencies(module, multiModule, mainModule).forEach( item=>body.push( item ) );
        this.createModuleAssets(module, multiModule, mainModule).forEach( item=>body.push( item ) );

        if( this.privateSymbolNode ){
            body.push( this.privateSymbolNode );
        }

        this.beforeBody.forEach( item=>item && body.push( item ) );
        this.construct && body.push( this.construct );
        body.push( this.createStatementMember('methods', this.methods ) );
        body.push( this.createStatementMember('members', this.members ) );
        body.push( this.createClassDescriptor() );
        this.afterBody.forEach( item=>item && body.push( item ) );
        if( multiModule ){
            if( mainModule === module ){
                body.push( this.createExportDeclaration(module.id ) );
            }else{
                const parenthes = this.createNode("ParenthesizedExpression");
                parenthes.expression = parenthes.createCalleeNode(this.createFunctionNode((ctx)=>{
                    this.parent = ctx;
                    ctx.body.push( classNode );
                    const stat = ctx.createNode('ReturnStatement');
                    stat.argument = stat.createIdentifierNode( module.id  );
                    ctx.body.push(stat);
                }));
                return this.createDeclarationNode('const',[
                    this.createDeclaratorNode( module.id,  parenthes)
                ]);
            }
        }else{
            body.push( this.createExportDeclaration(module.id) );
        }
        return this;
    }

    createClassStructuralBody(){
        const stack = this.stack;
        const module = this.module;
        this.id = this.createToken( stack.id );
        if(module.inherit){
            this.addDepend(module.inherit);
        }
        if( this.isActiveForModule(module.inherit) ){
            this.inherit = module.inherit;
        }
        this.implements = module.implements.filter( impModule=>{
            if( !impModule.isDeclaratorModule && impModule.isInterface ){
                this.addDepend(impModule);
                return this.isActiveForModule(impModule, module);
            }
            return false;
        });
        this.createClassMemebers(stack);
        this.addDepend( stack.compilation.getGlobalTypeById('Class') );
        const iteratorType = stack.compilation.getGlobalTypeById("Iterator");
        if( module.implements.includes(iteratorType) ){
            const method = this.createMethodNode( 'Symbol.iterator', (ctx)=>{
                const obj = ctx.createNode('ReturnStatement'); 
                obj.argument = obj.createThisNode();
                ctx.body.push( obj );
            });
            method.static = false;
            method.modifier = 'public';
            method.kind = 'method';
            method.key.computed = true;
            this.members.push( method );
        }

        if( this.privateProperties.length ){
            this.privateName = this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME, true, this, false);
            if( !this.privateSymbolNode ){
                this.privateSymbolNode = this.createPrivateSymbolNode(this.privateName);
            }

            if( this.construct ){
                const index = this.construct.body.body.findIndex( item=>{
                    if( item.type ==='ExpressionStatement' && item.expression.type==="CallExpression" ){
                        return item.expression.callee.object.type==="SuperExpression";
                    }
                    return false;
                });
                this.construct.body.body.splice(index+1,0,this.createConstructInitPrivateObject(this.privateName, this.privateProperties) )
            }
        }

        if( !this.construct && (this.privateProperties.length + this.initProperties.length) > 0){
            this.construct = this.createDefaultConstructMethod(module.id, this.privateProperties, this.initProperties);
        }

        this.checkConstructMethod();

        return this;
    }

    createPrivateSymbolNode(name){
        return this.createDeclarationNode(
            'const',
            [
                this.createDeclaratorNode(
                    name,
                    this.createCalleeNode( 
                        this.createIdentifierNode('Symbol'),
                        [this.createLiteralNode('private')]
                    )
                )
            ]
        );
    }

    checkConstructMethod(){
        const stack = this.stack;
        const module = this.module;
        if( !this.construct && (stack.isInterfaceDeclaration || stack.isClassDeclaration || stack.isEnumDeclaration) ){
            this.construct = this.createDefaultConstructMethod(module.id);
        }
    }

    createClassMemebers(stack){
        if( this.type !=="ClassDeclaration" )return;
        const cache1 = new Map();
        const cache2 = new Map();
        stack.body.forEach( item=> {
            const child = this.createClassMemeberNode(item);
            const isStatic = !!(stack.static || child.static);
            const refs  = isStatic ? this.methods : this.members;
            this.createAnnotations(child, item, isStatic);
            if( child.type ==="PropertyDefinition" ){
                if( !child.init ){
                    child.init = child.createLiteralNode(null);
                }
                if( !isStatic && child.modifier === "private"){
                    this.privateProperties.push(
                        this.createPropertyNode( child.key.value, child.init)
                    );
                }
            }
            if( item.isMethodSetterDefinition || item.isMethodGetterDefinition ){
                const name = child.key.value;
                const dataset = isStatic ? cache1 : cache2;
                var target = dataset.get( name );
                if( !target ){
                    target={
                        isAccessor:true,
                        kind:'accessor', 
                        key:child.key, 
                        modifier:child.modifier
                    };
                    dataset.set(name, target);
                    refs.push( target );
                }
                if( item.isMethodGetterDefinition ){
                    target.get =child;
                }else if( item.isMethodSetterDefinition ){
                    target.set = child;
                }
            }else if(item.isConstructor && item.isMethodDefinition){
                this.construct = child;
            }
            else{
                refs.push( child );
            }
        });
    }

    createAnnotations(node, memeberStack, isStatic){
        if(isStatic && node.modifier ==="public" &&  memeberStack.isMethodDefinition && memeberStack.isEnterMethod && !this.mainEnterMethods ){
            const mainEnterMethods = this.createStatementNode(
                this.createCalleeNode(
                    this.createMemberNode([
                        this.createIdentifierNode(this.module.id),
                        this.createIdentifierNode(node.key.value)
                    ])
                )
            );  
            this.mainEnterMethods = mainEnterMethods;
            const program = this.getParentByType('Program');
            if(program){
                program.afterBody.push( mainEnterMethods );
            }
        }
    }

    createClassMemeberNode( memeberStack ){
        return this.createToken(memeberStack);
    }

    createConstructInitPrivateObject(privateName, privateProperties){
        return this.createStatementNode( 
            this.createCalleeNode( 
                this.createMemberNode(['Object','defineProperty']),
                [
                    this.createThisNode(),
                    this.createIdentifierNode( privateName ),
                    this.createObjectNode([
                        this.createPropertyNode('value', this.createObjectNode( privateProperties ))
                    ])
                ]
            )
        )
    }

    createDefaultConstructMethod(methodName, privateProperties, initProperties, params=[]){
        const privateName = this.privateName;
        const inherit = this.inherit;
        const node = this.createMethodNode( methodName ? this.createIdentifierNode(methodName) : null, (ctx)=>{
            if( inherit ){
                const se = ctx.createNode('SuperExpression');
                se.value =  ctx.getModuleReferenceName(inherit);
                ctx.body.push( 
                    ctx.createStatementNode(
                        ctx.createCalleeNode( 
                            ctx.createMemberNode(
                                [
                                    se,
                                    ctx.createIdentifierNode('call')
                                ]
                            ),[
                                ctx.createThisNode()
                            ].concat(params)
                        )
                    )
                );
            }
            if( privateProperties && privateProperties.length && privateName ){
                ctx.body.push(
                    this.createConstructInitPrivateObject(privateName, privateProperties)
                );
            }
            if( initProperties && initProperties.length ){
                initProperties.forEach( item=>{
                    ctx.body.push( item );
                });
            }
        }, params);
        node.type ="FunctionDeclaration";
        return node;
    }

    createMemberDescriptor(key, node, modifier, kind){
        kind = kind || IDENT_MAP[node.kind];
        modifier = modifier || node.modifier;
        const properties = [];
        properties.push( this.createPropertyNode('m', this.createLiteralNode( MODIFIER_MAP[ modifier ] ) ) );
        properties.push( this.createPropertyNode('d', this.createLiteralNode(kind) ) );
        if( kind === Constant.DECLARE_PROPERTY_VAR ){
            properties.push( this.createPropertyNode('writable', this.createLiteralNode(true) ) );
        }
        if( (node.isAccessor || kind === Constant.DECLARE_PROPERTY_VAR || kind === Constant.DECLARE_PROPERTY_CONST) && modifier==="public" ){
            properties.push( this.createPropertyNode('enumerable', this.createLiteralNode(true) ) );
        }
        if( node.isAccessor ){
            if( node.get ){
                properties.push( this.createPropertyNode('get', node.get) ); 
            }
            if( node.set ){
                properties.push( this.createPropertyNode('set', node.set) );
            }
        }else{
            properties.push( this.createPropertyNode('value', node) );
        }
        return this.createPropertyNode(key, this.createObjectNode( properties ));
    }

    createClassDescriptor( className=null ){
        const description = [];
        const module = this.module;
        description.push(this.createPropertyNode('id', this.createLiteralNode( Constant.DECLARE_CLASS ) ));
        const ns = module.namespace && this.module.namespace.toString();
        if( ns ){
            description.push(this.createPropertyNode('ns', this.createLiteralNode( ns ) ) );
        }
        description.push(this.createPropertyNode('name', this.createLiteralNode( module.id ) ));
        if( module.dynamic ){
            description.push(this.createPropertyNode('dynamic', this.createLiteralNode(true) ));
        }
        if( this.privateName ){
            description.push(this.createPropertyNode('private',  this.createIdentifierNode( this.privateName ) ));
        }
        if( this.implements.length > 0 ){
            description.push(this.createPropertyNode('imps', this.createArrayNode(
                this.implements.map( item=> this.createIdentifierNode(this.getModuleReferenceName(item)) )
            )));
        }
        if( this.inherit ){
            description.push(this.createPropertyNode('inherit', this.createIdentifierNode( this.getModuleReferenceName(this.inherit) ) ) );
        }
        if( this.methods && this.methods.length ){
            description.push(this.createPropertyNode('methods', this.createIdentifierNode('methods') ));
        }
        if( this.members && this.members.length ){
            description.push(this.createPropertyNode('members', this.createIdentifierNode('members') ) );
        }
        const id = this.builder.getIdByModule( module );
        const args = [
            this.createLiteralNode(id), 
            this.createIdentifierNode( className || module.id ), 
            this.createObjectNode(description)
        ]
        if( module && module.isFragment ){
            args[0] = this.createIdentifierNode(null);
        }
        return this.createStatementNode( this.createCalleeNode( this.createMemberNode([this.checkRefsName('Class'),'creator']), args) );
    }

    createStatementMember(name, members){
        if( !members.length )return;
        return this.createStatementNode( 
            this.createDeclarationNode(
                'const',
                [
                    this.createDeclaratorNode(
                        name, 
                        this.createObjectNode( members.map( node=>this.createMemberDescriptor(node.key, node) ) )
                    )
                ]
            )
        );
    }

    createDependencies(module, multiModule=false, mainModule=null){
        const items = [];
        const dependencies = this.builder.getDependencies(module);
        var excludes = null;
        if( multiModule && mainModule && mainModule !== module ){
            excludes = this.builder.getDependencies(mainModule);
            excludes.push( mainModule );
        }
        dependencies.forEach( depModule =>{
            if( this.isActiveForModule( depModule ) && !(excludes && excludes.includes( depModule )) ){
                const name = this.builder.getModuleReferenceName(depModule, module);
                const source = this.builder.getModuleImportSource(depModule, module);
                items.push( this.createImportDeclaration(source, [[name]]) );
            }
        });
        if( module.isDeclaratorModule ){
            const polyfillModule = this.builder.getPolyfillModule( module.getName() );
            if( polyfillModule && polyfillModule.requires.size > 0 ){
                polyfillModule.requires.forEach( item=>{
                    const name = item.key;
                    const source = item.from;
                    //const extract = item.extract;
                    if( name !== item.value ){
                        items.push( this.createImportDeclaration(source, [[item.value, name]]) );
                    }else{
                        items.push( this.createImportDeclaration(source, [[name]]) );
                    }
                });
            }
        }
        return items;
    }

    createModuleAssets(module, multiModule=false, mainModule=null){
        var excludes = null;
        if( multiModule && mainModule && mainModule !== module ){
            excludes = this.builder.getModuleAssets(mainModule);
        }
        const assets = [];
        this.builder.getModuleAssets( module ).forEach( item=>{
            if( excludes ){
                const res = excludes.find( value=>value.source ===item.source && item.local===value.local );
                if( res ){
                    return;
                }
            }
            assets.push( this.createImportDeclaration(item.source, item.local ? [[item.local,item.imported]] : []) );
        });
        return assets;
    }

    createImportDeclaration(source, specifiers){
        const type = this.plugin.options.module;
        if( type ==='cjs'){
            const specifier = specifiers[0];
            if( specifier ){
                const name = specifier[0];
                return this.createDeclarationNode('const',[
                    this.createDeclaratorNode( name,  this.createCalleeNode( 
                        this.createIdentifierNode('require'),
                        [this.createLiteralNode( source )]
                    ))
                ]);
            }else{
                return this.createStatementNode( this.createCalleeNode( 
                    this.createIdentifierNode('require'),
                    [this.createLiteralNode( source )]
                ));
            }
        }else{
            return this.createImportNode( source, specifiers);
        }
    }

    createExportDeclaration( id ){
        const type = this.plugin.options.module;
        if( type ==='cjs'){
            return this.createStatementNode( 
                this.createAssignmentNode(
                    this.createMemberNode(['module','exports']), 
                    this.createIdentifierNode(id) 
                )
            );   
        }else{
            const node = this.createNode('ExportDefaultDeclaration');
            node.declaration = node.createIdentifierNode( id );
            return node;
        }
    }
}

module.exports = ClassBuilder;