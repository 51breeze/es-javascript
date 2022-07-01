module.exports = function(ctx,stack){

    const annotations = stack.annotations || [];
    var embeds = annotations.filter( item=>{
        return item.name.toLowerCase() ==='embed';
    });

    var init = null;
    if( embeds.length > 0  ){
        var items = [];
        var module = stack.module;
        embeds.forEach( embed=>{
            const args = embed.getArguments();
            args.forEach( item=>{
                if( item.resolveFile ){
                    const asset = module.assets.get( item.resolveFile );
                    if( asset.assign ){
                        items.push( asset.assign )
                    }else{
                        const value = ctx.builder.getFileRelativePath(stack.module.file, item.resolveFile);
                        items.push(value);
                    } 
                }
            });
        });
        init = items.length > 1 ? ctx.createArrayNode( items.map( value=>ctx.createIdentifierNode(value) ) ) : ctx.createIdentifierNode(items[0]);
    }

    const node = ctx.createNode(stack);
    node.declarations = (stack.declarations || []).map( item=>node.createToken(item) );
    node.modifier = stack.compiler.callUtils('getModifierValue', stack);
    node.static = !!stack.static;
    node.kind = stack.kind;
    node.key =  node.declarations[0].id;
    node.init = init || node.declarations[0].init;
    return node;
}