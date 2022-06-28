const Constant = require("../core/Constant");
const MODIFIER_MAP={
    "public":Constant.MODIFIER_PUBLIC,
    "protected":Constant.MODIFIER_PROTECTED,
    "private":Constant.MODIFIER_PRIVATE,
}

function createClassNode(ctx,stack){
    const module = stack;
    const node = ctx.createNode( stack );
    node.privateProperties=[];
    node.initProperties=[];
    node.beforeBody = [];
    node.afterBody = [];
    node.body = [];

    node.id = node.createToken( stack.id );
    if( node.isActiveForModule(module.inherit) ){
        node.inherit = node.createToken( stack.inherit );
        node.addDepend(module.inherit);
    }

    node.implements = stack.implements.filter( item=>{
        const impModule = item.getModuleById( item.value() );
        return !impModule.isDeclaratorModule && impModule.isInterface;
    }).map( item=>node.createToken(item) );

    this.imports = stack.imports.filter( 
        item=>node.isActiveForModule( item.getModuleById( item.value() ) ) 
    ).map( item=>node.createToken(item) );

    node.methods = [];
    node.members = [];
    node.construct = null;
    const caches = [new Map(), new Map()];
    stack.body.forEach( item=> {
        const child = node.createToken(item);
        const static = !!(stack.static || child.static);
        const refs  = static ? this.methods : this.members;
        if( item.isMethodGetterDefinition || item.isMethodGetterDefinition ){
            const name = item.key.value();
            const dataset = static ? caches[1] : caches[0];
            var target = dataset.get( name );
            if( !target ){
                dataset.set( name, target={isAccessor:true,kind:item.kind});
                refs.push( target );
            }
            if( item.isMethodGetterDefinition ){
                target.get =child;
            }else if( item.isMethodGetterDefinition ){
                target.set = child;
            }
        }else if(item.isConstructor && item.isMethodDefinition){
            node.construct = child;
        }
        else{
            refs.push( child );
        }
    });

    node.addDepend( stack.compilation.getGlobalModuleById('Class') );
    const iteratorType = stack.compilation.getGlobalModuleById("Iterator")
    if( module.implements.includes(iteratorType) ){
        const method = node.createMethodNode( 'Symbol.iterator', (ctx)=>{
            const obj = node.createNode('ReturnStatement'); 
            obj.argument = obj.createThisNode();
            ctx.body.push( obj );
        });
        method.key.compute = true;
        node.members.push( method );
    }

    if( node.privateProperties.length ){
        node.privateName = node.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
        node.beforeBody.push( node.createDeclarationNode(
            'const',
            ctx.createDeclaratorNode(
                node.privateName,
                ctx.createChunkNode('Symbol("private")')
            )
        ));
        node.privateName = node.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
    }

    if( !node.construct && (node.privateProperties.length + node.initProperties.length) > 0){
        node.construct = createDefaultConstructMethod(node, module.id, node.privateProperties, node.initProperties);
    }

    return node;
}


function createDefaultConstructMethod(ctx, name, privateProperties, initProperties){
    const privateName = ctx.privateName;
    return ctx.createMethodToken( ctx.createIdentifierNode(name), (ctx)=>{
        if( privateProperties && privateProperties.length && privateName ){
            ctx.body.push(
                ctx.createStatementNode( 
                    ctx.createCalleeNode( 
                        ctx.createMemberToken(['Object','defineProperty']),
                        [
                            ctx.createThisNode(),
                            ctx.createIdentifierNode( privateName ),
                            ctx.createObjectNode( Object.entries({value:ctx.createObjectNode( privateProperties )}) )
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
    });
}

function createMemberDescriptor(ctx, key, node, modifier, kind){
    kind = kind || node.kind;
    modifier = modifier || node.modifier;
    const properties = [];
    properties.push( ctx.createPropertyNode('m', MODIFIER_MAP[ modifier ]) );
    properties.push( ctx.createPropertyNode('id', kind) );
    if( kind === Constant.DECLARE_PROPERTY_VAR ){
        properties.push( ctx.createPropertyNode('writable', true) );
    }
    if( (node.isAccessor || kind === Constant.DECLARE_PROPERTY_VAR || kind === Constant.DECLARE_PROPERTY_CONST) && modifier==="public" ){
        properties.push( ctx.createPropertyNode('enumerable', true) );
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

function createClassDescriptor(ctx, module, _private, methods, members, imps, inherit){
    const description = [];
    description.push(ctx.createPropertyNode('id', Constant.DECLARE_CLASS));
    description.push(ctx.createPropertyNode('ns', ctx.createLiteralToken( `"${module.namespace.toString()}"` ) ) );
    description.push(ctx.createPropertyNode('name', module.id));
    if( module.dynamic ){
        description.push(ctx.createPropertyNode('dynamic',String(true)));
    }
    if( _private ){
        description.push(ctx.createPropertyNode('private',_private));
    }
    if( imps && imps.length > 0 ){
        description.push(ctx.createPropertyNode('imps', ctx.createArrayNode(
            imps.map( item=>ctx.getModuleReferenceName(item) )
        )));
    }
    if( inherit ){
        description.push(ctx.createPropertyNode('inherit',ctx.getModuleReferenceName(module.inherit, module)));
    }
    if( methods && methods.length ){
        description.push(ctx.createPropertyNode('methods', 'methods'));
    }
    if( members && members.length ){
        description.push(ctx.createPropertyNode('members', 'members'));
    }
    const args = [ctx.getIdByModule(module), module.id, ctx.createObjectNode(description)]
    if( module && module.isFragment ){
        args[0] = 'null';
    }
    return ctx.createStatementNode( ctx.createCalleeNode( ctx.createMemberNode([ctx.checkRefsName('Class'),'creator']), args) );
}

function createExportExpression(ctx, id ){
    return ctx.createStatementNode( 
        ctx.createAssignmentNode(
            ctx.createMemberNode(['module','exports']), 
            ctx.createIdentifierNode(id) 
        )
    );
}

function createStatementMember(ctx, name, members){
    if( !members.length )return;
    return ctx.createStatementNode( 
        ctx.createDeclarationNode(
            'const',
            ctx.createDeclaratorNode(
                name, 
                ctx.createObjectNode( members.map( node=>createMemberDescriptor(ctx, node.key, node) ) )
            )
        )
    );
}

function createDependencies(ctx, module){
    const items = [];
    const dependencies = ctx.builder.getDependencies(module);
    dependencies.forEach( depModule =>{
        if( ctx.isActiveForModule( depModule ) ){
            const name = ctx.builder.getModuleReferenceName(depModule, module);
            const source = ctx.builder.getModuleImportSource(depModule, module);
            items.push( ctx.createImportToken( source, [[null,name]]) );
        }
    });
    return items;
}

function createModuleAssets(ctx, module){
    const assets = ctx.builder.getModuleAssets( module ).map( item=>{
        return ctx.createImportToken( item.source, [[item.imported,item.local]]);
    });
    return assets;
}

function ClassDeclaration(ctx,stack,type){
    const classNode = createClassNode(ctx,stack,type);
    const module = stack.module;
    const body = classNode.body;
    classNode.imports.forEach( item=>body.push( item ) );
    createDependencies(classNode, module).forEach( item=>body.push( item ) );
    createModuleAssets(classNode, module).forEach( item=>body.push( item ) );
    classNode.beforeBody.forEach( item=>body.push( item ) );
    body.push( classNode.construct );
    body.push( createStatementMember(classNode,'methods', classNode.methods ) );
    body.push( createStatementMember(classNode, 'members', classNode.members ) );
    body.push( createClassDescriptor(
        classNode, 
        module, 
        classNode.privateName,
        classNode.methods,
        classNode.members,
        classNode.implements,
        classNode.inherit
    ));
    classNode.afterBody.forEach( item=>body.push( item ) );
    body.push( createExportExpression( module.id ) );
    return classNode;
}

ClassDeclaration.createClassNode = createClassNode;
ClassDeclaration.createDefaultConstructMethod = createDefaultConstructMethod;
ClassDeclaration.createMemberDescriptor = createMemberDescriptor;
ClassDeclaration.createClassDescriptor = createClassDescriptor;
ClassDeclaration.createExportExpression = createExportExpression;
ClassDeclaration.createStatementMember = createStatementMember;
ClassDeclaration.createDependencies = createDependencies;
ClassDeclaration.createModuleAssets = createModuleAssets;
module.exports = ClassDeclaration;