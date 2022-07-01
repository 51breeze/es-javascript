const Constant = require("../core/Constant");
const MODIFIER_MAP={
    "public":Constant.MODIFIER_PUBLIC,
    "protected":Constant.MODIFIER_PROTECTED,
    "private":Constant.MODIFIER_PRIVATE,
}

const IDENT_MAP={
    "get":Constant.DECLARE_PROPERTY_ACCESSOR,
    "set":Constant.DECLARE_PROPERTY_ACCESSOR,
    "var":Constant.DECLARE_PROPERTY_VAR,
    "const":Constant.DECLARE_PROPERTY_CONST,
    "method":Constant.DECLARE_PROPERTY_FUN,
};

function createClassNode(ctx,stack){
    const module = stack.module;
    const node = ctx.createNode( stack );
    node.privateProperties=[];
    node.initProperties=[];
    node.beforeBody = [];
    node.afterBody = [];
    node.body = [];

    node.id = node.createToken( stack.id );
    if( node.isActiveForModule(module.inherit) ){
        node.inherit = module.inherit;
        node.addDepend(module.inherit);
    }

    node.implements = module.implements.filter( impModule=>{
        return !impModule.isDeclaratorModule && impModule.isInterface;
    });

    node.methods = [];
    node.members = [];
    node.construct = null;
    var mainEnterMethods = null;
    if( stack.isClassDeclaration ){
        const cache1 = new Map();
        const cache2 = new Map();
        stack.body.forEach( item=> {
            const child = node.createToken(item);
            const static = !!(stack.static || child.static);
            const refs  = static ? node.methods : node.members;
            if( child.type ==="PropertyDefinition" ){
                if( !static && child.modifier === "private"){
                    node.privateProperties.push(
                        ctx.createPropertyNode( child.key.value, child.init )
                    );
                }
            }

            if( item.isMethodSetterDefinition || item.isMethodGetterDefinition ){
                const name = child.key.value;
                const dataset = static ? cache1 : cache2;
                var target = dataset.get( name );
                if( !target ){
                    target={isAccessor:true,kind:child.kind, key:child.key, modifier:child.modifier};
                    dataset.set(name, target);
                    refs.push( target );
                }
                if( item.isMethodGetterDefinition ){
                    target.get =child;
                }else if( item.isMethodSetterDefinition ){
                    target.set = child;
                }
            }else if(item.isConstructor && item.isMethodDefinition){
                node.construct = child;
            }
            else{

                if(static && child.modifier ==="public" &&  item.isMethodDefinition && item.isEnterMethod && !mainEnterMethods ){
                    mainEnterMethods = ctx.createStatementNode(ctx.createCalleeNode(
                        ctx.createMemberNode([
                            ctx.createIdentifierNode(module.id),
                            ctx.createIdentifierNode(child.key.value)
                        ])
                    ));  
                    const program = ctx.getParentByType('Program');
                    program.afterBody.push( mainEnterMethods );
                }

                refs.push( child );
            }
        });
    }

    node.addDepend( stack.compilation.getGlobalTypeById('Class') );
    const iteratorType = stack.compilation.getGlobalTypeById("Iterator")
    if( module.implements.includes(iteratorType) ){
        const method = node.createMethodNode( 'Symbol.iterator', (ctx)=>{
            const obj = node.createNode('ReturnStatement'); 
            obj.argument = obj.createThisNode();
            ctx.body.push( obj );
        });
        method.static = false;
        method.modifier = 'public';
        method.kind = 'method';
        method.key.computed = true;
        node.members.push( method );
    }

    if( node.privateProperties.length ){
        node.privateName = node.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
        node.beforeBody.push( node.createDeclarationNode(
            'const',
            [
                ctx.createDeclaratorNode(
                    node.privateName,
                    ctx.createCalleeNode( 
                        ctx.createIdentifierNode('Symbol'),
                        [ctx.createLiteralNode('private')]
                    )
                )
            ]
        ));
        node.privateName = node.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
        if( node.construct ){
            const index = node.construct.body.body.findIndex( item=>{
                if( item.type ==='ExpressionStatement' && item.expression.type==="CallExpression" ){
                    return item.expression.callee.object.type==="SuperExpression";
                }
                return false;
            });
            node.construct.body.body.splice(index+1,0,createConstructInitPrivateObject(node, node.privateName, node.privateProperties) )
        }
    }

    if( !node.construct && (node.privateProperties.length + node.initProperties.length) > 0){
        node.construct = createDefaultConstructMethod(node, module, node.privateProperties, node.initProperties);
    }

    if( !node.construct && (stack.isInterfaceDeclaration || stack.isClassDeclaration || stack.isEnumDeclaration) ){
        node.construct = createDefaultConstructMethod(node, module);
    }

    return node;
}

function createConstructInitPrivateObject(ctx, privateName, privateProperties){
    return ctx.createStatementNode( 
        ctx.createCalleeNode( 
            ctx.createMemberNode(['Object','defineProperty']),
            [
                ctx.createThisNode(),
                ctx.createIdentifierNode( privateName ),
                ctx.createObjectNode([
                    ctx.createPropertyNode('value', ctx.createObjectNode( privateProperties ))
                ])
            ]
        )
    )
}

function createDefaultConstructMethod(ctx, module, privateProperties, initProperties){
    const privateName = ctx.privateName;
    const inherit = ctx.inherit;
    return ctx.createMethodNode( ctx.createIdentifierNode(module.id), (ctx)=>{
        if( inherit ){
            const se = ctx.createNode('SuperExpression');
            se.value =  ctx.getModuleReferenceName(module.inherit);
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
                        ]
                    )
                )
            );
        }
        if( privateProperties && privateProperties.length && privateName ){
            ctx.body.push(
                createConstructInitPrivateObject(ctx, privateName, privateProperties)
            );
        }
        if( initProperties && initProperties.length ){
            initProperties.forEach( item=>{
                ctx.body.push( item );
            });
        }
    });
}

function createMemberDescriptor(ctx, key, node, modifier, kind){
    kind = kind || IDENT_MAP[node.kind];
    modifier = modifier || node.modifier;
    const properties = [];
    properties.push( ctx.createPropertyNode('m', ctx.createLiteralNode( MODIFIER_MAP[ modifier ] ) ) );
    properties.push( ctx.createPropertyNode('id', ctx.createLiteralNode(kind) ) );
    if( kind === Constant.DECLARE_PROPERTY_VAR ){
        properties.push( ctx.createPropertyNode('writable', ctx.createLiteralNode(true) ) );
    }
    if( (node.isAccessor || kind === Constant.DECLARE_PROPERTY_VAR || kind === Constant.DECLARE_PROPERTY_CONST) && modifier==="public" ){
        properties.push( ctx.createPropertyNode('enumerable', ctx.createLiteralNode(true) ) );
    }
    if( node.isAccessor ){
        if( node.get ){
            properties.push( ctx.createPropertyNode('get', node.get) ); 
        }
        if( node.set ){
            properties.push( ctx.createPropertyNode('set', node.set) );
        }
    }else{
        properties.push( ctx.createPropertyNode('value', node) );
    }
    return ctx.createPropertyNode(key, ctx.createObjectNode( properties ));
}

function createClassDescriptor(ctx, module, _private, methods, members, imps, inherit, exportName){
    const description = [];
    description.push(ctx.createPropertyNode('id', ctx.createLiteralNode( Constant.DECLARE_CLASS ) ));
    const ns = module.namespace.toString();
    if( ns ){
        description.push(ctx.createPropertyNode('ns', ctx.createLiteralNode( module.namespace.toString() ) ) );
    }
    description.push(ctx.createPropertyNode('name', ctx.createLiteralNode( module.id ) ));
    if( module.dynamic ){
        description.push(ctx.createPropertyNode('dynamic', ctx.createLiteralNode(true) ));
    }
    if( _private ){
        description.push(ctx.createPropertyNode('private',  ctx.createIdentifierNode(_private) ));
    }
    if( imps && imps.length > 0 ){
        description.push(ctx.createPropertyNode('imps', ctx.createArrayNode(
            imps.map( item=> ctx.createIdentifierNode(ctx.getModuleReferenceName(item)) )
        )));
    }
    if( inherit ){
        description.push(ctx.createPropertyNode('inherit', ctx.createIdentifierNode( ctx.getModuleReferenceName(module.inherit, module) ) ) );
    }
    if( methods && methods.length ){
        description.push(ctx.createPropertyNode('methods', ctx.createIdentifierNode('methods') ));
    }
    if( members && members.length ){
        description.push(ctx.createPropertyNode('members', ctx.createIdentifierNode('members') ) );
    }
    const id = ctx.builder.getIdByModule(module);
    const args = [
        ctx.createLiteralNode(id), 
        ctx.createIdentifierNode( exportName || module.id), 
        ctx.createObjectNode(description)
    ]
    if( module && module.isFragment ){
        args[0] = ctx.createIdentifierNode('null');
    }
    return ctx.createStatementNode( ctx.createCalleeNode( ctx.createMemberNode([ctx.checkRefsName('Class'),'creator']), args) );
}

function createStatementMember(ctx, name, members){
    if( !members.length )return;
    return ctx.createStatementNode( 
        ctx.createDeclarationNode(
            'const',
            [
                ctx.createDeclaratorNode(
                    name, 
                    ctx.createObjectNode( members.map( node=>createMemberDescriptor(ctx, node.key, node) ) )
                )
            ]
        )
    );
}

function createDependencies(ctx, module, multiModule=false, mainModule=null){
    const items = [];
    const dependencies = ctx.builder.getDependencies(module);
    var excludes = null;
    if( multiModule && mainModule && mainModule !== module ){
        excludes = ctx.builder.getDependencies(mainModule);
        excludes.push( mainModule );
    }
    dependencies.forEach( depModule =>{
        if( ctx.isActiveForModule( depModule ) && !(excludes && excludes.includes( depModule )) ){
            const name = ctx.builder.getModuleReferenceName(depModule, module);
            const source = ctx.builder.getModuleImportSource(depModule, module);
            items.push( createImportDeclaration(ctx, source, [[name]]) );
        }
    });
    return items;
}

function createModuleAssets(ctx, module, multiModule=false, mainModule=null){
    var excludes = null;
    if( multiModule && mainModule && mainModule !== module ){
        excludes = ctx.builder.getModuleAssets(mainModule);
    }
    const assets = ctx.builder.getModuleAssets( module ).map( item=>{
        if( excludes ){
           const res = excludes.find( value=>value.source ===item.source && item.local===value.local );
           if( res ){
                return;
           }
        }
        return createImportDeclaration(ctx, item.source, item.local ? [[item.local,item.imported]] : []);
    });
    return assets;
}

function createImportDeclaration(ctx, source, specifiers){
    const type = ctx.builder.getConfig('module');
    if( type ==='cjs'){
        const specifier = specifiers[0];
        if( specifier ){
            const name = specifier[0];
            return ctx.createDeclarationNode('const',[
                ctx.createDeclaratorNode( name,  ctx.createCalleeNode( 
                    ctx.createIdentifierNode('require'),
                    [ctx.createLiteralNode( source )]
                ))
            ]);
        }else{
            return ctx.createStatementNode( ctx.createCalleeNode( 
                ctx.createIdentifierNode('require'),
                [ctx.createLiteralNode( source )]
            ));
        }
    }else{
        return ctx.createImportNode( source, specifiers);
    }
}

function createExportDeclaration(ctx, id ){
    const type = ctx.builder.getConfig('module');
    if( type ==='cjs'){
        return ctx.createStatementNode( 
            ctx.createAssignmentNode(
                ctx.createMemberNode(['module','exports']), 
                ctx.createIdentifierNode(id) 
            )
        );   
    }else{
        const node = ctx.createNode('ExportDefaultDeclaration');
        node.declaration = node.createIdentifierNode( id );
        return node;
    }
}

function ClassDeclaration(ctx,stack,type){
    const classNode = createClassNode(ctx,stack,type);
    const module = stack.module;
    const body = classNode.body;
    const multiModule = stack.compilation.modules.size > 1;
    var mainModule = module;
    if( multiModule ){
        mainModule = Array.from( stack.compilation.modules.values() )[0];
    }

    createDependencies(classNode, module, multiModule, mainModule).forEach( item=>body.push( item ) );
    createModuleAssets(classNode, module, multiModule, mainModule).forEach( item=>body.push( item ) );

    classNode.beforeBody.forEach( item=>item && body.push( item ) );
    body.push( classNode.construct );
    body.push( createStatementMember(classNode,'methods', classNode.methods ) );
    body.push( createStatementMember(classNode, 'members', classNode.members ) );
    body.push( createClassDescriptor(
        classNode, 
        module, 
        classNode.privateName,
        classNode.methods,
        classNode.members,
        module.implements.filter( item=>classNode.isActiveForModule(item) ),
        classNode.isActiveForModule(module.inherit) ? module.inherit : null
    ));
    classNode.afterBody.forEach( item=>item && body.push( item ) );

    if( multiModule ){
        if( mainModule === module ){
            body.push( createExportDeclaration(classNode, module.id ) );
        }else{
            const parenthes = ctx.createNode("ParenthesizedExpression");
            parenthes.expression = parenthes.createCalleeNode(ctx.createFunctionNode((ctx)=>{
                classNode.parent = ctx;
                ctx.body.push( classNode );
                const stat = ctx.createNode('ReturnStatement');
                stat.argument = stat.createIdentifierNode( module.id  );
                ctx.body.push(stat);
            }));
            return ctx.createDeclarationNode('const',[
                ctx.createDeclaratorNode( module.id,  parenthes)
            ]);
        }
    }else{
        body.push( createExportDeclaration(classNode, module.id ) );
    }
    return classNode;
}

ClassDeclaration.createClassNode = createClassNode;
ClassDeclaration.createDefaultConstructMethod = createDefaultConstructMethod;
ClassDeclaration.createMemberDescriptor = createMemberDescriptor;
ClassDeclaration.createClassDescriptor = createClassDescriptor;
ClassDeclaration.createExportDeclaration = createExportDeclaration;
ClassDeclaration.createStatementMember = createStatementMember;
ClassDeclaration.createDependencies = createDependencies;
ClassDeclaration.createModuleAssets = createModuleAssets;
module.exports = ClassDeclaration;