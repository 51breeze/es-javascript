const ClassDeclaration = require("./ClassDeclaration");
module.exports = function(ctx, stack, type){

    const module = this.module;
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
            node.addDepend( dep );
        }
    });

    if( node.isActiveForModule(module.inherit) ){
        this.inherit = module.inherit;
    }

    if( polyfillModule.id !== 'Class' &&  polyfillModule.createClass !== false ){
        this.addDepend( this.getGlobalModuleById('Class') );
    }

    node.body = [];
    const body = node.body;
    ClassDeclaration.createDependencies(node, module).forEach( item=>body.push( item ) );
    ClassDeclaration.createModuleAssets(node, module).forEach( item=>body.push( item ) );
    body.push( node.createChunkNode( content ) );
    if( polyfillModule.id !== 'Class' && polyfillModule.createClass !== false ){
        body.push( ClassDeclaration.createClassDescriptor(module) );
    }
    body.push( ClassDeclaration.createExportExpression(node, polyfillModule.export) );
    return node;

}