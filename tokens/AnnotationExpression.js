const allMethods = ['get','post','put','delete','option','router'];

function getAnnotationArgItem(name, args, indexes){
    name = String(name).toLowerCase()
    let index = args.findIndex(item=>{
        const key = String(item.key).toLowerCase();
        return key=== name || name==='param' && key==='params';
    });
    if( index < 0 ){
        index = indexes.indexOf(name);
        if( index>= 0 ){
            const arg = args[index];
            return arg && !arg.assigned ? arg : null;
        }
    }
    return args[index];
}

function createHttpAnnotation(ctx,stack){
    const args = stack.getArguments();
    const indexes=['classname','action', 'param', 'data','method','config'];
    const moduleClass = getAnnotationArgItem(indexes[0], args, indexes);
    const actionArg = getAnnotationArgItem(indexes[1], args, indexes);
    const paramArg = getAnnotationArgItem(indexes[2], args, indexes);
    const dataArg = getAnnotationArgItem(indexes[3], args, indexes);
    const methodArg = getAnnotationArgItem(indexes[4], args, indexes);
    const configArg = getAnnotationArgItem(indexes[5], args, indexes);

    const providerModule = stack.getModuleById(moduleClass.value);
    if( !providerModule ){
        ctx.error(`Class '${moduleClass.value}' is not exists.`);
    }else{
        const member = actionArg && providerModule.getMember(actionArg.value);
        if( !member || !stack.compiler.callUtils('isModifierPublic',member) || 
            !(member.isMethodDefinition && !(member.isMethodGetterDefinition || member.isMethodSetterDefinition) ) ){
            ctx.error(`Method '${moduleClass.value}::${actionArg && actionArg.value}' is not exists.`);
        }else{
            ctx.compilation.setServerPolicy(providerModule);
            const routeConfigNode = createRouteConfig(ctx, providerModule, member, paramArg);
            const createArgNode =( argItem )=>{
                if( argItem ){
                    if( argItem.stack.isAssignmentPattern ){
                        return ctx.createToken( argItem.stack.right );
                    }else{
                        return ctx.createToken( argItem.stack );
                    }
                }
                return null;
            }

            const System = stack.getGlobalTypeById("System");
            const Http = stack.getModuleById("net.Http");
            ctx.addDepend( System );
            ctx.addDepend( Http );

            const props = {
                'data':createArgNode(dataArg),
                'options':createArgNode(configArg),
                'method': methodArg && allMethods.includes(methodArg.value) ? ctx.createLiteralNode(methodArg.value) : null
            };
            const properties = Object.keys(props).map( name=>{
                const value = props[name];
                if( value ){
                    return ctx.createPropertyNode(name, value);
                }
                return null;
            }).filter( item=>!!item );

            let calleeArgs = [
                ctx.createIdentifierNode(
                    ctx.checkRefsName( 
                        ctx.builder.getModuleReferenceName(Http, stack.module)
                    ) 
                ),
                routeConfigNode
            ];

            if( properties.length>0 ){
                calleeArgs.push(ctx.createObjectNode(properties));
            }
            
            return ctx.createCalleeNode(
                ctx.createMemberNode([
                    ctx.checkRefsName(
                        ctx.builder.getModuleReferenceName(System, stack.module)
                    ),
                    'createHttpRequest'
                ]),
                calleeArgs,
                stack
            );
        }
    }
    return null;
}

function createRouterAnnotation(ctx,stack){
    const args = stack.getArguments();
    const indexes=['classname','action','param'];
    const moduleClass = getAnnotationArgItem(indexes[0],args, indexes);
    const module = stack.getModuleById(moduleClass.value);
    if( !module ){
        ctx.error(`Class '${moduleClass.value}' is not exists.`);
    }else{
        if( module.isModule && module.isClass && stack.isModuleForWebComponent(module) ){
            let route = ctx.builder.getModuleRoutes(module);
            if(route && Array.isArray(route) )route = route[0];
            if( !route ){
                return ctx.createLiteralNode(module.getName('/'));
            }
            const paramArg = getAnnotationArgItem('param', args, [,'param']);
            if( !paramArg ){
                return ctx.createLiteralNode(ctx.builder.createRoutePath(route))
            }else{
                const System = stack.getGlobalTypeById("System");
                const routePath = '/'+route.path.split('/').map( segment=>{
                    if( segment.charCodeAt(0)===58 ){
                        return  '<'+segment.slice(1)+'>'
                    }
                    return segment;
                }).filter( val=>!!val ).join('/');
                let paramNode = ctx.createToken(paramArg.assigned ? paramArg.stack.right :  paramArg.stack);
                ctx.addDepend( System );
                if( route.params ){
                    const defaultParams = ctx.createObjectNode(
                        Object.keys(route.params).map( name=>{
                            const value = route.params[name];
                            return ctx.createPropertyNode(name, ctx.createLiteralNode(value));
                        })
                    );
                    paramNode = ctx.createCalleeNode(
                        ctx.createMemberNode([
                            ctx.createIdentifierNode('Object'),
                            ctx.createIdentifierNode('assign')
                        ]),
                        [
                            defaultParams,
                            paramNode
                        ]
                    );
                }
                return ctx.createCalleeNode(
                    ctx.createMemberNode([
                        ctx.checkRefsName(
                            ctx.builder.getModuleReferenceName(System, stack.module)
                        ),
                        'createHttpRoute'
                    ]),
                    [
                        ctx.createLiteralNode(routePath), 
                        paramNode
                    ],
                    stack
                );
            }

        }else{
            const actionArg = getAnnotationArgItem(indexes[1],args, indexes);
            const paramArg = getAnnotationArgItem(indexes[2],args, indexes);
            const method = actionArg && module.getMember(actionArg.value);
            if( !method || !stack.compiler.callUtils('isModifierPublic',method) || 
                !(method.isMethodDefinition && !(method.isMethodGetterDefinition || method.isMethodSetterDefinition) ) ){
                ctx.error(`Method '${moduleClass.value}::${actionArg && actionArg.value}' is not exists.`);
            }else{
                ctx.compilation.setServerPolicy(module);
                return createRouteConfig(ctx, module, method, paramArg);
            }
        }
    }
    return ctx.createLiteralNode(null);
}

function createRouteConfig(ctx, module, method, paramArg, flag=false){
    const annotations = method.annotations;
    const annotation = annotations && annotations.find( (item)=>{
        return allMethods.includes(item.name.toLowerCase());
    });

    const mapNameds = ['path'];
    const args = annotation ? annotation.getArguments() : [];
    const pathArg = annotation ? getAnnotationArgItem(mapNameds[0], args, mapNameds) : null;
    const value = String( pathArg ? pathArg.value : method.value() );
    const defaultParams = [];
    const declareParams = (method.params||[]).map( item=>{
        const required = !(item.question || item.isAssignmentPattern);
        const question = required ? '' : '?';
        if( item.isAssignmentPattern ){
            if( item.right.isLiteral ){
                defaultParams.push(ctx.createPropertyNode(ctx.createIdentifierNode(item.value()),ctx.createToken(item.right)))
            }else{
                item.right.error(10101, item.value())
            }
        }
        return `<${item.value()}${question}>`;
    });
    const uri = declareParams.length > 0 ? [value].concat(declareParams).join('/') : value;
    const url = uri.charCodeAt(0)===47 ? uri : `/${module.id}/${uri}`;
    let allowMethodNode = ctx.createLiteralNode( annotation ? annotation.name.toLowerCase() : '*');
    if( annotation && annotation.name.toLowerCase() ==='router' ){
        const allowMethods = args.filter( item=>item !== pathArg );
        if( allowMethods.length > 0 ){
            allowMethodNode = ctx.createArrayNode( allowMethods.map( item=>ctx.createLiteralNode(item.value) ) );
        }else{
            allowMethodNode = ctx.createLiteralNode('*');
        }
    }

    let paramNode = null;
    if( paramArg ){
        if( paramArg.stack.isAssignmentPattern ){
            paramNode = ctx.createToken( paramArg.stack.right );
        }else{
            paramNode = ctx.createToken( paramArg.stack );
        }
    }

    const props = {
        'url':ctx.createLiteralNode(url),
        'param':paramNode,
        'allowMethod':allowMethodNode
    };

    if( defaultParams.length > 0 ){
        props['default'] = ctx.createObjectNode(defaultParams);
    }

    return ctx.createObjectNode(
        Object.keys(props).map( name=>{
            const value = props[name];
            if( value ){
                return ctx.createPropertyNode(name, value);
            }
            return null;
        }).filter( item=>!!item )
    );
}

module.exports = function(ctx,stack,type){
    const args = stack.getArguments();
    const name = stack.name;
    switch( name.toLowerCase() ){
        case 'provider' : 
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
            const providerModule = stack.getModuleById(moduleClass.value);
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
                        ctx.compilation.setServerPolicy(providerModule);
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
        case 'http' :  {
            return createHttpAnnotation(ctx,stack) || ctx.createLiteralNode(null);
        }
        case 'router' :{
            return createRouterAnnotation(ctx,stack);
        }
        case 'url':{
            const arg = args[0];
            if(arg && arg.resolveFile){
                const asset = (stack.module||stack.compilation).assets.get( arg.resolveFile );
                if(asset && asset.assign){
                    return ctx.createIdentifierNode( asset.assign );
                }
            }
            return ctx.createLiteralNode('');
        }
        case 'env':{
            const metadata = ctx.plugin.options.metadata;
            const env = metadata.env || {};
            if( args.length > 0 ){
                if( args.length > 1 ){
                    const result = args.slice(1).some( item=>ctx.builder.isEnv(args[0].value, item.value))
                    return ctx.createLiteralNode(result);
                }
                return ctx.createLiteralNode(env[ args[0].value ]);
            }else{
                ctx.error( `The '${name}' annotations missing params.` );
                return ctx.createLiteralNode(null);
            }
        }
        default :
            ctx.error( `The '${name}' annotations is not supported.` );
    }
    return null;
};