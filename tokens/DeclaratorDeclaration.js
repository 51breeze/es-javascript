const ClassBuilder = require("../core/ClassBuilder");
module.exports = function(ctx, stack, type){

    const module = stack.module;
    const polyfillModule = ctx.builder.getPolyfillModule( module.getName() );
    if( !polyfillModule ){
        return null;
    }

    const node = new ClassBuilder(stack, ctx, type);
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
            node.addDepend( dep );
        }
    });

    if( node.isActiveForModule(module.inherit) ){
        node.inherit = module.inherit;
    }

    if( polyfillModule.id !== 'Class' &&  polyfillModule.createClass !== false ){
        node.addDepend( stack.getGlobalTypeById('Class') );
    }

    const body = node.body;
    node.createDependencies(module).forEach( item=>body.push( item ) );
    node.createModuleAssets(module).forEach( item=>body.push( item ) );
    body.push( node.createChunkNode( content ) );

    if( polyfillModule.id !== 'Class' && polyfillModule.createClass !== false ){
        body.push( node.createClassDescriptor(polyfillModule.export) );
    }
    body.push( node.createExportDeclaration(polyfillModule.export) );
    return node;
}