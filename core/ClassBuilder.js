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
        this.moduleReferenceTarget = null;
        this.inheritReferenceTarget = null;
        this.addListener('onCreateRefsName',(event)=>{
            if( event.name === Constant.REFS_DECLARE_PRIVATE_NAME && event.top===true ){
                event.prevent = true;
                this.privateSymbolNode = this.createPrivateSymbolNode(event.value);
            }
        });
    }

    create(){

        if( !this.checkSyntaxPresetForClass() ){
            return null;
        }

        const module = this.module;
        const body = this.body;
        const multiModule = this.stack.compilation.modules.size > 1;
        const mainModule = this.compilation.mainModule;
        this.createClassStructuralBody();
        this.createModuleAssets(module, multiModule, mainModule);

        if( !multiModule || mainModule === module ){
            body.push( ...this.createDependencies(module, multiModule, mainModule) );
            const references = this.builder.geImportReferences( module );
            if( references ){
                body.push( ...Array.from( references.values() ) );
            } 
        }else{
            const program = this.getParentByType('Program');
            if( program.isProgram && program.imports ){
                program.imports.push( ...this.createDependencies(module, multiModule, mainModule) );
                const references = this.builder.geImportReferences( module );
                if( references ){
                    program.imports.push( ...Array.from( references.values() ) );
                }
            }
        }

        if( this.privateSymbolNode ){
            body.push( this.privateSymbolNode );
        }

        this.beforeBody.forEach( item=>item && body.push( item ) );
        this.construct && body.push( this.construct );
        
        body.push( this.createStatementMember(this.checkRefsName('methods'), this.methods ) );
        body.push( this.createStatementMember(this.checkRefsName('members'), this.members ) );
        body.push( this.createClassDescriptor() );
        this.afterBody.forEach( item=>item && body.push( item ) );
        if( multiModule ){
            if( mainModule === module ){
                body.push( this.createExportDeclaration(module.id ) );
            }else{
                const parenthes = this.createNode("ParenthesizedExpression");
                parenthes.expression = parenthes.createCalleeNode(this.createFunctionNode((ctx)=>{
                    this.parent = ctx;
                    ctx.body.push( this );
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

    checkSyntaxPresetForClass(){
        const stack = this.stack;
        const module = this.module;
        const annotations = stack.annotations;
        if( annotations ){
            const syntaxAnnotation = annotations.find( annotation=>annotation.name.toLowerCase() ==='syntax');
            if( syntaxAnnotation ){
                const args = syntaxAnnotation.getArguments();
                if( args[0] ){
                    if( this.builder.isSyntax( args[0].value ) ){
                        this.compilation.setClientPolicy(module);
                        return true;
                    }else{
                        return false;
                    }
                }
            }
        }
        return true;
    }

    makeInheritClass(inheritClass){

    }

    createClassStructuralBody(){
        const stack = this.stack;
        const module = this.module;
        this.id = this.createToken( stack.id );
        if(module.inherit){
            this.addDepend(module.inherit);
        }
        if( this.isActiveForModule(module.inherit, module) ){
            this.inherit = module.inherit;
            this.makeInheritClass(module.inherit);
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

        if( this.construct ){
            this.createConstructInitPrivateNode(this.construct.body, module.inherit ? 1 : 0 )
        }else{
            this.construct = this.createDefaultConstructMethod(module.id);
        }

        this.checkConstructMethod();
        return this;
    }

    createPrivateRefsName(){
        if( !this.privateName && this.plugin.options.enablePrivateChain){
            this.privateName = this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME, true, Token.SCOPE_REFS_All, this);
            if( !this.privateSymbolNode ){
                this.privateSymbolNode = this.createPrivateSymbolNode(this.privateName);
            }
        }
        return this.privateName;
    }

    createPrivateSymbolNode(name){
        if(!this.plugin.options.enablePrivateChain)return null;
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

    checkCallSuperES6Class(construct, module){
        if(construct && module){
            const inherit = module.inherit
            if(inherit && this.builder.isDeclaratorModuleDependency(inherit)){
                const ReflectModule = this.builder.getGlobalModuleById("Reflect")
                this.addDepend(ReflectModule);
                const reflectName = this.builder.getModuleReferenceName(ReflectModule, module);
                const ctx = construct.body;
                const wrap = this.createNode('FunctionExpression');
                const block = construct.createNode('BlockStatement');
                const node = this.createReturnNode(
                    ctx.createCalleeNode(this.createMemberNode([reflectName,'apply']), [
                        wrap,
                        ctx.createCalleeNode(
                            this.createMemberNode([reflectName,'construct']),
                            [
                                this.createIdentifierNode(ctx.getModuleReferenceName(inherit,module)),
                                ctx.createIdentifierNode('arguments'),
                                ctx.createIdentifierNode(module.id)
                            ]
                        )
                    ])
                );
                ctx.body.push(wrap.createReturnNode(wrap.createThisNode()))
                wrap.body = ctx;
                ctx.parent = wrap;
                block.body = [node];
                node.parent = block;
                construct.body = block;
            }
        }
    }

    checkConstructMethod(){
        const stack = this.stack;
        const module = this.module;
        if( !this.construct && (stack.isInterfaceDeclaration || stack.isClassDeclaration || stack.isEnumDeclaration) ){
            this.construct = this.createDefaultConstructMethod(module.id);
        }
        this.checkCallSuperES6Class(this.construct, module);
    }

    createPrivatePropertyNode(stack,child,isStatic){
        if( !isStatic && this.plugin.options.enablePrivateChain && child.modifier === "private"){
            this.privateProperties.push(
                this.createPropertyNode( child.key.value, child.init)
            );
        }
    }

    createClassMemebers(stack){
        if( this.type !=="ClassDeclaration" )return;
        const cache1 = new Map();
        const cache2 = new Map();
        stack.body.forEach( item=> {
            const child = this.createClassMemeberNode(item, stack);
            if(!child)return;
            const isStatic = !!(stack.static || child.static);
            const refs  = isStatic ? this.methods : this.members;
            if( child.type ==="PropertyDefinition" ){
                if( !child.init ){
                    child.init = child.createLiteralNode(null);
                }
                this.createPrivatePropertyNode(item,child,isStatic);
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
            if( program.isProgram && program.afterBody ){
                program.afterBody.push( mainEnterMethods );
            }else{
                this.afterBody.push(mainEnterMethods);
            }
            node.mainEnterMethod = true;
        }
        return node;
    }

    createClassMemeberNode( memeberStack, classStack ){
        const node = this.createToken(memeberStack);
        if( node ){
            const isStatic = !!(classStack.static || node.static);
            this.createAnnotations(node, memeberStack, isStatic);
        }
        return node;
    }

    createConstructInitPrivateNode(block, appendAt=NaN ){
        if( !(this.privateProperties.length > 0) )return;
        const privateName = this.createPrivateRefsName();
        const node =this.createStatementNode( 
            this.createCalleeNode( 
                this.createMemberNode(['Object','defineProperty']),
                [
                    this.createThisNode(),
                    this.createIdentifierNode( privateName ),
                    this.createObjectNode([
                        this.createPropertyNode('configurable', this.createLiteralNode(true)),
                        this.createPropertyNode('value', this.createObjectNode( this.privateProperties ))
                    ])
                ]
            )
        )
        appendAt = isNaN(appendAt) ? block.body.length : Math.max(appendAt < 0 ? block.body.length + appendAt : appendAt, 0);
        block.body.splice(appendAt,0,node);
    }

    createDefaultConstructMethod(methodName, params=[]){
        const initProperties = this.initProperties;
        const inherit = this.inherit;
        const node = this.createMethodNode( methodName ? this.createIdentifierNode(methodName) : null, (ctx)=>{
            this.createConstructInitPrivateNode(ctx);
            if( inherit ){
                const se = ctx.createNode('SuperExpression');
                se.value =  ctx.getModuleReferenceName(inherit);
                const args = params.length > 0 ? this.createArrayNode( params ) : this.createIdentifierNode('arguments');
                ctx.body.push( 
                    ctx.createStatementNode(
                        ctx.createCalleeNode( 
                            ctx.createMemberNode(
                                [
                                    se,
                                    ctx.createIdentifierNode('apply')
                                ]
                            ),[
                                ctx.createThisNode(),
                                args 
                            ]
                        )
                    )
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
        }else if(this.builder.isDeclaratorModuleDependency(module.inherit)){
            description.push(this.createPropertyNode('inherit', this.createIdentifierNode( this.getModuleReferenceName(module.inherit) ) ) );
        }

        if( this.methods && this.methods.length ){
            description.push(this.createPropertyNode('methods', this.createIdentifierNode(this.checkRefsName('methods')) ));
        }
        if( this.members && this.members.length ){
            description.push(this.createPropertyNode('members', this.createIdentifierNode(this.checkRefsName('members')) ) );
        }

        const refsExtends = [this.moduleReferenceTarget, this.inheritReferenceTarget].filter( val=>!!val ).map( name=>this.createIdentifierNode(name) );
        if( refsExtends.length>0 ){
            description.push(this.createPropertyNode('extends',this.createArrayNode(refsExtends)));
            const construct = this.construct
            if( construct ){
                if( construct.body.type==='BlockStatement' ){
                    construct.body.body.unshift(
                        this.createStatementNode( 
                            this.createCalleeNode(
                                this.createMemberNode([
                                    this.checkRefsName(this.builder.getModuleReferenceName(this.builder.getGlobalModuleById('Class'))),
                                    'callSuper'
                                ]),
                                [
                                    this.createIdentifierNode(module.id),
                                    this.createThisNode(),
                                    this.createCalleeNode(this.createMemberNode(['Array','from']),[this.createIdentifierNode('arguments')])
                                ]
                            )
                        )
                    );
                }
            }
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

        return this.createStatementNode( this.createCalleeNode( this.createMemberNode([
            this.builder.getModuleReferenceName(this.builder.getGlobalModuleById('Class')),
            'creator'
        ]), args) );
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
        var polyfillModule = null;
        if( multiModule && mainModule && mainModule !== module ){
            excludes = this.builder.getDependencies(mainModule);
            excludes.push( mainModule );
        }
        if( module.isDeclaratorModule ){
            polyfillModule = this.builder.getPolyfillModule( module.getName() );
        }
        dependencies.forEach( depModule =>{
           
            if( !(excludes && excludes.includes( depModule )) && this.builder.isPluginInContext(depModule) ){
                if( this.isActiveForModule( depModule ) ){
                    const name = this.builder.getModuleReferenceName(depModule, module);
                    const source = this.builder.getModuleImportSource(depModule, module);
                    this.builder.addAsset(module, source, 'normal',depModule);
                    items.push( this.createImportDeclaration(source, [[name]]) );
                }else if(depModule.isDeclaratorModule && this.builder.isUsed(depModule, module)){
                    this.addImportReferenceNode(depModule, true, module);
                    this.builder.getModuleAssets(depModule).forEach( item=>{
                        let local = item.local;
                        let imported = item.imported;
                        let namespaced = !!item.namespaced;
                        let source = item.source;
                        if( depModule.id === item.local ){
                            local = this.builder.getModuleReferenceName(depModule, module);
                        }
                        this.createImportAssetsIfNotExists(module, item, source, local, imported, namespaced);
                    });
                }
            }
        });
        
        if( polyfillModule && polyfillModule.requires.size > 0 ){
            polyfillModule.requires.forEach( item=>{
                if( !this.builder.isNeedImportDependence(item.from, module) ){
                    return;
                }
                const name = item.key;
                let source = this.builder.getSourceFileMappingFolder(item.from);
                if( source === null ){
                    source = item.from;
                }
                if( source ){
                    const extract = item.extract;
                    if( name && item.value && name !== item.value || extract ){
                        items.push( this.createImportDeclaration(source, [[item.value, name, !!item.namespaced]]) );
                        this.builder.addAsset(module, source, 'normal',item);
                    }else{
                        items.push( this.createImportDeclaration(source, [[name, null, !!item.namespaced]]) );
                        this.builder.addAsset(module, source, 'normal', item);
                    }
                }
            });
        }
        
        return items;
    }

    createModuleAssets(module, multiModule=false, mainModule=null){
        var excludes = null;
        if( multiModule && mainModule && mainModule !== module ){
            excludes = this.builder.getModuleAssets(mainModule);
        }

        const inherit = module && module.isModule && module.inherit;
        this.builder.getModuleAssets( module ).forEach( item=>{
            if( excludes ){
                const res = excludes.find( value=>value.source ===item.source && item.local===value.local );
                if( res ){
                    return;
                }
            }
           
            let local = item.local;
            if(inherit && inherit.id===item.local){
                local = this.checkRefsName( '__$'+item.local );
                this.inheritReferenceTarget = local;
            }else if(module.id===item.local){
                local = this.checkRefsName( '__$'+item.local );
                this.moduleReferenceTarget = local;
            }

            this.createImportAssetsIfNotExists(module, item, item.source, local, item.imported, !!item.namespaced);
        });

        if( module && module.isModule ){
            this.addImportReferenceNode(module);
        }
    }

    createImportAssetsIfNotExists(module, originAsset, source, local, imported, namespaced=false){
        if( !this.builder.isNeedImportDependence(source, module) ){
            return;
        }
        
        if(!this.builder.hasImportReference(module, source)){
            if( this.builder.addAsset(module, source, 'assets', originAsset) ){
                let _source = this.builder.getSourceFileMappingFolder(source);
                if( _source === null ){
                    _source = source;
                }
                if(_source){
                    this.builder.addImportReference( 
                        module, 
                        source, 
                        this.createImportDeclaration( 
                            _source,
                            local ? [[local,imported,namespaced]] : []
                        ) 
                    );
                }
            }
        }
    }

    addImportReferenceNode(module, sameModuleNameFlag=false, contextModule=null){
        const stack = module && module.isModule ? this.compilation.getStackByModule(module) : module.stack;
        const inherit = module && module.isModule && module.inherit;

        if( stack && stack.imports && stack.imports.length > 0 ){
            const ckeckItem = (target, local)=>{
                if(!target)return false;
                if(inherit && inherit.id===target.value){
                    target.value = this.checkRefsName( '__$'+target.value );
                    if(!fetchDepNameFlag){
                        this.inheritReferenceTarget = target.value;
                    }
                }else if(module.id === target.value){
                    if(local){
                        target.value = local;
                    }else{
                        target.value = this.checkRefsName( '__$'+target.value );
                        if(!fetchDepNameFlag){
                            this.moduleReferenceTarget = target.value;
                        }
                    }
                }
            }
            const checkSameId = (node, local)=>{
                if( node.type==='ImportDeclaration'){
                    node.specifiers.forEach( specifier=>{
                        ckeckItem(specifier.local, local);
                    });
                }else if( node.type==='VariableDeclaration'){
                    node.declarations.forEach( declare=>{
                        if( declare.type==='VariableDeclarator' ){
                            if( declare.id.type==='Identifier' ){
                                ckeckItem(declare.id, local);
                            }else if(declare.id.type==='ObjectPattern'){
                                declare.id.properties.forEach( property=>{
                                    ckeckItem(property.key, local);
                                });
                            }
                        }
                    });
                }
            }

            stack.imports.forEach( item=>{
                if( item.source.isLiteral ){
                    const desc = item.description();
                    if( !desc ){
                        let source = item.source.value();
                        if( source ){
                            if( !this.builder.isNeedImportDependence(source, module) ){
                                return;
                            }

                            let flag = true;
                            if( item.specifiers.length >0 ){
                                const owner = item.additional;
                                flag = item.specifiers.some( item=>{
                                    if(!sameModuleNameFlag && inherit && inherit.id===item.value()){
                                        return true;
                                    }
                                    if(owner && owner.module && owner.module.id === item.value()){
                                        return owner.module.used;
                                    }
                                    return item.isDeclarator ? item.useRefItems.size > 0 : false;
                                });
                            }

                            if(flag /*&& !this.builder.hasImportReference(this.module, source)*/){
                                const node = this.createToken( item );
                                if( node ){
                                    const local = sameModuleNameFlag && contextModule ? this.builder.getModuleReferenceName(module, contextModule) : null; 
                                    checkSameId(node, local);  
                                    let resolve = this.builder.getSourceFileMappingFolder(source, true);
                                    this.builder.addAsset(module, source, 'assets', {source, resolve, isImport:true, type:'assets', stack:item});
                                    this.builder.addImportReference(this.module, source , node);
                                }
                            }
                        }
                    }
                }
            });
        }
    }





    createExportDeclaration( id ){
        const type = this.plugin.options.module;
        if( type ==='cjs'){
            return this.createStatementNode( 
                this.createAssignmentNode(
                    this.createMemberNode(['module','exports']), 
                    id instanceof Token ? id : this.createIdentifierNode(id)
                )
            );
        }else{
            const node = this.createNode('ExportDefaultDeclaration');
            node.declaration = id instanceof Token ? id : node.createIdentifierNode( id );
            return node;
        }
    }
}

module.exports = ClassBuilder;