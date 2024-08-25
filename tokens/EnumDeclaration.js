const Constant = require("../core/Constant");
const ClassBuilder = require("../core/ClassBuilder");
module.exports = function(ctx,stack,type){
    if( !stack.isExpressionDeclare ){
        const node = new ClassBuilder(stack, ctx, 'ClassDeclaration');
        const properties = stack.properties.map( item=>node.createToken(item) ).map( item =>{
            return node.createMemberDescriptor(item.key, item.init, 'public', Constant.DECLARE_PROPERTY_ENUM_VALUE);
        });
        node.methods.push( ...properties );
        return node.create()
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