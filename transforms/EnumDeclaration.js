const ClassDeclaration = require("./ClassDeclaration");
const Constant = require("../core/Constant");

function createStatementMember(ctx, name, members){
    if( !members.length )return;
    const items = [];
    members.forEach( item =>{
        const property = ClassDeclaration.createMemberDescriptor(ctx, item.key, item.init, 'public', Constant.DECLARE_PROPERTY_ENUM_VALUE);
        items.push( property );
        const key = ClassDeclaration.createMemberDescriptor(ctx, item.init, ctx.createLiteralNode(item.key.value), 'public', Constant.DECLARE_PROPERTY_ENUM_KEY);
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
        node.body.push( node.construct );
        node.body.push( createStatementMember(node, 'methods', node.properties) );
        node.body.push( ClassDeclaration.createClassDescriptor(node, module,  null, node.properties, null, null, node.inherit) );
        node.body.push( ClassDeclaration.createExportDeclaration(node, module.id ) );
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