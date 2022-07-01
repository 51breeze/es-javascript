const ClassDeclaration = require("./ClassDeclaration");
module.exports = function(ctx, stack, type){

    const module = stack.module;
    const polyfillModule = ctx.plugin.getPolyfill( module.getName() );
    if( !polyfillModule ){
        return null;
    }

    const node = ctx.createNode( stack );

    const content = polyfillModule.content;
    polyfillModule.require.forEach( name=>{
        const module = stack.getModuleById(name);
        if( module ){
            node.addDepend( module );
        }else{
            node.error(`the '${name}' dependency does not exist`);
        }
    });

    module.extends.forEach( dep=>{
        if( dep.isClass ){
            ctx.addDepend( dep );
        }
    });

    if( node.isActiveForModule(module.inherit) ){
        node.inherit = module.inherit;
    }

    if( polyfillModule.id !== 'Class' &&  polyfillModule.createClass !== false ){
        ctx.addDepend( stack.getGlobalTypeById('Class') );
    }

    node.body = [];
    const body = node.body;
    ClassDeclaration.createDependencies(node, module).forEach( item=>body.push( item ) );
    ClassDeclaration.createModuleAssets(node, module).forEach( item=>body.push( item ) );
    body.push( node.createChunkNode( content ) );
    if( polyfillModule.id !== 'Class' && polyfillModule.createClass !== false ){
        body.push( ClassDeclaration.createClassDescriptor(node, module, null, null, null, null, node.inherit, polyfillModule.export) );
    }
    body.push( ClassDeclaration.createExportDeclaration(node, polyfillModule.export) );
    return node;

}