
const Constant = require("../core/Constant");
function createStatementMember(ctx, name, members){
    if( !members.length )return;
    const items = [];
    members.forEach( item =>{
        const property = ctx.createMemberDescriptor(item.key, item.init, 'public', Constant.DECLARE_PROPERTY_ENUM_VALUE);
        items.push( property );
        const key = ctx.createMemberDescriptor(item.init, ctx.createLiteralNode(item.key.value), 'public', Constant.DECLARE_PROPERTY_ENUM_KEY);
        items.push( key );
    });
    return ctx.createStatementNode( 
        ctx.createDeclarationNode(
            'const',
            [
                ctx.createDeclaratorNode(
                    name, 
                    ctx.createObjectNode( items )
                )
            ]
        )
    );
}

const ClassBuilder = require("../core/ClassBuilder");
module.exports = function(ctx,stack,type){

    if( stack.parentStack.isPackageDeclaration ){
        const node = new ClassBuilder(stack, ctx, type);
        const module = stack.module;
        if( node.isActiveForModule(module.inherit) ){
            node.inherit = module.inherit;
        }
        node.construct = node.createDefaultConstructMethod(module.id);
        node.addDepend( stack.compilation.getGlobalTypeById('Class') );
        node.methods = stack.properties.map( item=>node.createToken(item) );
        node.body.push( ...node.createDependencies(module) );
        node.createModuleAssets(module);

        const references = node.builder.geImportReferences( module );
        if( references ){
            body.push( ...Array.from( references.values() ) );
        }

        node.body.push( node.construct );
        node.body.push( createStatementMember(node, 'methods', node.methods) );
        node.body.push( node.createClassDescriptor() );
        node.body.push( node.createExportDeclaration(module.id) );
        return node;
    }else{
        const name = stack.value();
        const init = ctx.createAssignmentNode( ctx.createIdentifierNode(name), ctx.createObjectNode());
        const properties = stack.properties.map( item =>{
            const initNode = ctx.createMemberNode( [ctx.createIdentifierNode(name), ctx.createLiteralNode(item.key.value(), void 0, item.key)] );
            initNode.computed = true;
            const initAssignmentNode = ctx.createAssignmentNode(
                initNode, 
                ctx.createLiteralNode(
                    item.init.value(), 
                    item.init.value(), 
                    item.init
                )
            );
            const left = ctx.createMemberNode( [ctx.createIdentifierNode(name), initAssignmentNode]);
            left.computed = true;
            return ctx.createAssignmentNode(left, ctx.createLiteralNode(item.key.value(), void 0, item.key));
        });
        properties.push( ctx.createIdentifierNode(name) );
        return ctx.createDeclarationNode('var', [
            ctx.createDeclaratorNode(name, ctx.createParenthesNode(ctx.createSequenceNode([init, ...properties])))
        ]);
    }
}