const dateset = new Map();
function cache(module){
    if( !dateset.has(module) ){
        dateset.set(module,{});
    }
    return dateset.get(module);
}

module.exports = function(ctx,stack){
    const isMember = stack.callee.isMemberExpression;
    const desc = stack.descriptor();
    const module = stack.module;
    const isChainExpression = stack.parentStack.isChainExpression;
    if(stack.callee.isSuperExpression){
        const parent = module && module.inherit;
        if( parent ){
            if( !ctx.isActiveForModule(parent, stack.module) ){
                return null;
            }
        }
    }else if( isMember && stack.callee.object.isSuperExpression){
        const parent = module && module.inherit;
        if( parent ){
            if( !ctx.isActiveForModule(parent, stack.module) ){
                return ctx.createCalleeNode( ctx.createMemberNode([ctx.checkRefsName('Class'),'callSuperMethod']), [
                    ctx.createIdentifierNode(module.id),
                    ctx.createThisNode(),
                    ctx.createLiteralNode(stack.callee.property.value(), void 0, stack.callee.property),
                    ctx.createArrayNode( stack.arguments.map( item=>ctx.createToken(item) ) )
                ]);
            }
        }
    }

    // if( !isMember ){
    //     let callee = stack.callee.value();
    //     if( callee === "date" ){
    //         const node = ctx.createNode( stack );
    //         const args = stack.arguments.map( item=>node.createToken(item) );
    //         if( args.length > 1 ){
    //             node.callee = ctx.createMemberNode([
    //                 node.createIdentifierNode('moment',stack.callee), 
    //                 node.createIdentifierNode('unix') 
    //             ]);
    //             node.arguments=args.slice(1,2);
    //         }else{
    //             node.callee = node.createIdentifierNode(callee,stack.callee);
    //             node.arguments=[];
    //         }
    //         return ctx.createCalleeNode( 
    //             ctx.createMemberNode([
    //                 node, 
    //                 node.createIdentifierNode('format') 
    //             ]), 
    //             args.slice(0,1)
    //         );
    //     }else if( callee === "time" ){
    //         const node = ctx.createNode( stack );
    //         node.callee = ctx.createMemberNode([
    //             node.createCalleeNode( 
    //                 node.createIdentifierNode('moment',stack.callee)
    //             ), 
    //             node.createIdentifierNode('unix') 
    //         ]);
    //         node.arguments=[];
    //         return node;
    //     }
    // }

    if( isMember && desc && desc.isType && desc.isAnyType && !isChainExpression ){
        const strict = ctx.plugin.options.strict;
        if(strict){
            ctx.addDepend( stack.getGlobalTypeById("Reflect") );
            const property = stack.callee.computed ? ctx.createToken(stack.callee.property) : ctx.createLiteralNode(stack.callee.property.value(), void 0, stack.callee.property);
            const args = [
                module ? ctx.createIdentifierNode(module.id) : ctx.createLiteralNode(null),
                ctx.createToken(stack.callee.object),
                property,
                ctx.createArrayNode( stack.arguments.map( item=>ctx.createToken(item) ) )
            ];
            if( stack.callee.object.isSuperExpression ){
                args.push(ctx.createThisNode())
            }
            return ctx.createCalleeNode(
                ctx.createMemberNode([ctx.checkRefsName("Reflect"),'call']),
                args,
                stack
            );
        }
    }else if( stack.callee.isSuperExpression || isMember && stack.callee.object.isSuperExpression && !isChainExpression ){
        return ctx.createCalleeNode(
            ctx.createMemberNode(
                [
                    ctx.createToken(stack.callee),
                    ctx.createIdentifierNode('call'),
                ]
            ),
            [ctx.createThisNode()].concat( stack.arguments.map( item=>ctx.createToken(item) ) ),
            stack
        );
    }

    const enablePrivateChain = ctx.plugin.options.enablePrivateChain;
    if( enablePrivateChain && desc && desc.isMethodDefinition ){
        const modifier = stack.compiler.callUtils('getModifierValue', desc);
        const refModule = desc.module;
        if( modifier==="private" && refModule.children.length > 0){
            return ctx.createCalleeNode(
                ctx.createMemberNode(
                    [
                        ctx.createToken(stack.callee),
                        ctx.createIdentifierNode('call'),
                    ]
                ),
                [ isMember ? ctx.createToken(stack.callee.object) : ctx.createThisNode() ].concat( stack.arguments.map( item=>ctx.createToken(item) ) ),
                stack
            );
        }
    }

    if(desc){
        let type = desc.isCallDefinition ? desc.module : desc;
        //call constructor method
        if(!isMember && !stack.callee.isSuperExpression && desc.isMethodDefinition)type = desc.module;
        if( ctx.compiler.callUtils("isTypeModule", type) ){
            ctx.addDepend(desc);
        }
    }

    const node = ctx.createNode( stack );
    node.callee = node.createToken( stack.callee );
    node.arguments = stack.arguments.map( item=>node.createToken(item) );
    node.isChainExpression = isChainExpression;
    return node;
}