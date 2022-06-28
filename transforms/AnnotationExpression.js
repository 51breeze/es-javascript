module.exports = function(ctx,stack,type){
    const args = stack.getArguments();
    const name = stack.name;
    switch( name ){
        case 'Provider' : 
            const indexMap=['className','action','method']
            const getItem=(name)=>{
                let index = args.findIndex(item=>item.key === name);
                if( index < 0 ){
                    index = indexMap.indexOf(name);
                }
                return args[index];
            }
            const moduleClass = getItem( indexMap[0] );
            const action = getItem( indexMap[1] );
            const method = getItem( indexMap[2] ) || {value:'Get'};
            const providerModule = stack.getModuleById(moduleClass.value , true);
            if( !providerModule ){
                ctx.error(`Class '${moduleClass.value}' is not exists.`);
            }else{
                const member = providerModule.getMember(action.value);
                if( !member || (member.modifier && member.modifier.value() !=="public") ){
                    ctx.error(`Method '${moduleClass.value}::${action.value}' is not exists.`);
                }else{
                    const annotation = member.annotations.find( item=>method.value.toLowerCase() == item.name.toLowerCase() );
                    if( !annotation ){
                        ctx.error(`Router '${method.value}' method is not exists. in ${moduleClass.value}::${action.value}`);
                    }else{
                        ctx.compilation.setPolicy(2, providerModule);
                        const params = annotation.getArguments();
                        const value = params[0] ? params[0].value : action.value;
                        const node = ctx.createNode(stack,'Literal');
                        if( value.charCodeAt(0)===47 ){
                            node.value = value;
                            node.raw = `"${value}"`;
                        }else{
                            node.value = `/${providerModule.id.toLowerCase()}/${value}`;
                            node.raw = `"/${providerModule.id.toLowerCase()}/${value}"`;
                        }
                        return node;
                    }
                }
            }
            return null;
        default :
            ctx.error( `The '${name}' annotations is not supported.` );
    }
    return null;
};