const ClassBuilder = require("../core/ClassBuilder");
module.exports = function(ctx, stack, type){

    const module = stack.module;
    const polyfillModule = ctx.builder.getPolyfillModule( module.getName() );
    if( !polyfillModule ){
        return null;
    }

    const node = new ClassBuilder(stack, ctx, type);
    const content = polyfillModule.content;

    if( !node.checkSyntaxPresetForClass() ){
        return null;
    }

    polyfillModule.references.forEach( item=>{
        const module = stack.getModuleById(item.from);
        if( module ){
            node.addDepend( module );
        }else{
            node.error(`the '${item.from}' dependency does not exist`);
        }
    });

    if( node.isActiveForModule(module.inherit) ){
        node.inherit = module.inherit;
    }

    if( polyfillModule.id !== 'Class' &&  polyfillModule.createClass !== false ){
        node.addDepend( stack.getGlobalTypeById('Class') );
    }

    const body = node.body;
    node.createModuleAssets(module);
    body.push( ...node.createDependencies(module) );

    if( polyfillModule.referenceAssets ){
        const references = node.builder.geImportReferences( module );
        if( references ){
            body.push( ...Array.from( references.values() ) );
        }
    }
   
    body.push( node.createChunkNode( content ) );

    if( polyfillModule.id !== 'Class' && polyfillModule.createClass !== false ){
        body.push( node.createClassDescriptor(polyfillModule.export) );
    }
    body.push( node.createExportDeclaration(polyfillModule.export) );
    return node;
}