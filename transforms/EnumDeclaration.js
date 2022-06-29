const ClassDeclaration = require("./ClassDeclaration");
const Constant = require("../core/Constant");

function createStatementMember(ctx, name, members){
    if( !members.length )return;
    const items = [];
    members.forEach( item =>{
        const property = ClassDeclaration.createMemberDescriptor(ctx, item.key, item.init, 'public', Constant.DECLARE_PROPERTY_ENUM_VALUE);
        items.push( property );
        const key = ClassDeclaration.createMemberDescriptor(ctx, item.init, item.key, 'public', Constant.DECLARE_PROPERTY_ENUM_KEY);
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

module.exports = function(ctx,stack,type){

    if( stack.parentStack.isPackageDeclaration ){
        const node = ClassDeclaration.createClassNode(ctx,stack);
        const module = stack.module;
        node.properties = stack.properties.map( item=>node.createToken(item) );
        ClassDeclaration.createDependencies(node,module).forEach( item=> node.body.push(item) );
        ClassDeclaration.createModuleAssets(node,module).forEach( item=> node.body.push(item) );
        node.body.push( ClassDeclaration.createDefaultConstructMethod(node,module.id) );
        node.body.push( createStatementMember(node, 'methods', node.properties) );
        node.body.push( ClassDeclaration.createClassDescriptor(node, module,  null, node.properties, null, null, node.inherit) );
        node.body.push( ClassDeclaration.createExportExpression(node, module.id ) );
        return node;
    }else{
        const name = stack.value();
        const init = ctx.createAssignmentNode( ctx.createIdentifierNode(name), ctx.createObjectNode());
        const properties = stack.properties.map( item =>{
            const initNode = ctx.createMemberNode( [ctx.createIdentifierNode(name), ctx.createLiteralNode(item.key.value(), null, item.key)] );
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
            return ctx.createAssignmentNode(left, ctx.createLiteralNode(item.key.value(), null, item.key));
        });
        return ctx.createDeclarationNode('const', [
            ctx.createDeclaratorNode(name, ctx.createSequenceNode([init, ...properties]))
        ]);
    }
}