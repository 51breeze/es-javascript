const ClassDeclaration = require("./ClassDeclaration");
module.exports = function(ctx,stack,type){
    const module = stack.module;
    const node = ClassDeclaration.createClassNode(ctx,stack);
    ClassDeclaration.createDependencies(node,module).forEach( item=>node.body.push( item ) );
    node.body.push( node.construct );
    node.body.push( ClassDeclaration.createClassDescriptor(node,module,null,null,null,node.implements,node.inherit) );
    node.body.push( ClassDeclaration.createExportDeclaration(ctx, module.id ) );
    return node;
}