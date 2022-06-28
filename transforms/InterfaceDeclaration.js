const ClassDeclaration = require("./ClassDeclaration");
module.exports = function(ctx,stack,type){
    const module = stack.module;
    const node = ClassDeclaration.createClassNode(ctx,stack);
    ClassDeclaration.createDependencies(node,module).forEach( item=>node.body( item ) );
    node.body( ClassDeclaration.createDefaultConstructMethod(node, module.id) );
    node.body( ClassDeclaration.createClassDescriptor(node,module,null,null,null,node.implements,node.inherit) );
    node.body( ClassDeclaration.createExportExpression(ctx, module.id ) );
    return node;
}