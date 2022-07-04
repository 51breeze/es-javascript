function makeConfigObject(ctx, data){
    const items = [];
    Object.entries(data).map( item=>{
        const [key, value] = item;
        if( value ){
            if( Array.isArray(value) ){
                if( value.length > 0 ){
                    const isObject = value[0].type ==='Property';
                    if( isObject ){
                        items.push( ctx.createPropertyNode( ctx.createIdentifierNode(key), ctx.createObjectNode(value) ) );
                    }else{
                        items.push( ctx.createPropertyNode( ctx.createIdentifierNode(key), ctx.createArrayNode(value) ) );
                    }
                }
            }else{
                if( value.type ==="Property"){
                    items.push( value );
                }else{
                    items.push( ctx.createPropertyNode( ctx.createIdentifierNode(key), value) );
                }
            }
        }
    });
    return items.length > 0 ? ctx.createObjectNode(items) : null;
}


function createAttributes(ctx, stack, data, spreadAttributes ){

    const pushEvent=(name,callback, category)=>{
        const events =  data[ category ] || (data[ category ]=[]);
        events.push( ctx.createPropertyNode(name, callback) );
    }

    const toFun = (item,content)=>{
        if( item.value.isJSXExpressionContainer ){
            const expr = item.value.expression;
            if( expr.isAssignmentExpression ){
                return ctx.createCalleeNode(
                    ctx.createMemberNode([
                        ctx.createParenthesNode(
                            ctx.createFunctionNode((block)=>{
                                block.body=[
                                    content
                                ]
                            })
                        ),
                        ctx.createIdentifierNode('bind')
                    ]),
                    [
                      ctx.createThisNode()
                    ]
                );
            }
        }
        return content;
    }

    stack.openingElement.attributes.forEach(item=>{
        if( item.isAttributeXmlns || item.isAttributeDirective ){
            if( item.isAttributeDirective ){
                const name = item.name.value();
                if( name === 'show'){
                    data.directives.push(
                        ctx.createObjectNode([
                            ctx.createPropertyNode(ctx.createIdentifierNode('name'), ctx.createLiteralNode('show') ),
                            ctx.createPropertyNode(ctx.createIdentifierNode('value'), ctx.createToken( item.valueArgument.expression ) ),
                        ])
                    );
                }
            }
            return;
        }else if( item.isJSXSpreadAttribute ){
            spreadAttributes && spreadAttributes.push( ctx.createToken( item ) );
            return;
        }else if( item.isAttributeSlot ){
            return;
        }

        let value = ctx.createToken( item );
        if( !value )return;

        let ns = value.namespace;
        let name = value.name;

        if( ns && ns.includes('::') ){
            let [seg,className] = ns.split('::',2);
            ns = seg;
            const moduleClass = ctx.getModuleReferenceName( stack.getModuleById(className) );
            name = ctx.createMemberNode([
                ctx.createIdentifierNode( moduleClass ),
                name
            ], name);
        }

        if( ns ==="@events" ){
            pushEvent( name, toFun(item,value), 'on')
            return;
        }else if( ns ==="@natives" ){
            pushEvent( name, toFun(item,value), 'nativeOn')
            return;
        }else if( ns ==="@binding" ){
            data.directives.push(
                ctx.createObjectNode([
                    ctx.createPropertyNode(ctx.createIdentifierNode('name'), ctx.createLiteralNode('model') ),
                    ctx.createPropertyNode(ctx.createIdentifierNode('value'), value ),
                ])
            );
            const funNode = ctx.createCalleeNode(
                ctx.createMemberNode([
                    ctx.createParenthesNode(
                        ctx.createFunctionNode((block)=>{
                            block.body=[
                                ctx.createStatementNode(
                                    ctx.createAssignmentNode(
                                        value,
                                        ctx.createChunkNode(`event && event.target && event.target.nodeType===1 ? event.target.value : event`, false)
                                    )
                                )
                            ]
                        })
                    ),
                    ctx.createIdentifierNode('bind')
                ]),
                [
                  ctx.createThisNode()
                ]
            );
            pushEvent(ctx.createIdentifierNode('input') , funNode , 'on');
        }

        let propName = name = value.name.value;
        if( item.isMemberProperty ){

            let isDOMAttribute = false;
            let attrDesc = item.getAttributeDescription( stack.getSubClassDescription() );
            if( attrDesc ){
                isDOMAttribute = attrDesc.annotations.some( item=>item.name.toLowerCase() === 'domattribute' );
                const alias = attrDesc.annotations.find( item=>item.name.toLowerCase() === 'alias' );
                if( alias ){
                    const args = alias.getArguments();
                    if( args.length > 0) {
                        propName = args[0].value;
                    }
                }
            }
            if( !isDOMAttribute ){
                data.props.push( ctx.createPropertyNode( ctx.createIdentifierNode(propName, value.name.stack ), value.value ) );
                return;
            }
        }

        const property = ctx.createPropertyNode( ctx.createIdentifierNode(propName, value.name.stack), value.value );
        switch(name){
            case "class" :
            case "style" :
            case "key" :
            case "ref" :
            case "refInFor" :
            case "tag" :
            case "staticStyle" :
            case "staticClass" :
                data[name] = property
                break;
            case "innerHTML" :
                data.domProps.push( property );
                break;
            case "value" :
            default:
                data.attrs.push( property );
        }
    });
}

function createProperties(ctx, children, data ){
    children.forEach( child=>{
        if( child.isProperty ){
            const node = ctx.createToken( child );
            data.props.push( ctx.createPropertyNode( node.name,  node.value ) );
        }else if( child.isSlot ){
            // const name = child.attributes.find( attr=>attr.name.value().toLowerCase() ==='name' );
            // const scope = child.attributes.find( attr=>attr.name.value().toLowerCase() ==='scope' );
            // const children = child.children.map( child=>this.make(child) );
        }
    });
}

function makeDirectives(ctx, child, element, prevResult){
    const cmd=[];
    let content = [];
    if( !child.directives || !(child.directives.length > 0) ){
        return {cmd,child,content:[element]};
    }
    const directives = child.directives.slice(0).sort( (a,b)=>{
        return b.name.value() === 'each' ? -1 : 0;
    });
   
    while( directives.length > 0){
        const directive = directives.shift();
        const name = directive.name.value();
        const valueArgument = directive.valueArgument;
        if( name ==="each" || name ==="for" ){
            let refs = ctx.createToken(valueArgument.expression);
            let item = valueArgument.declare.item;
            let key = valueArgument.declare.key;
            let index = valueArgument.declare.index;
            if( cmd.includes('if') ){
                cmd.pop();
                content.push( ctx.createLiteralNode('null','null')  );
                element = cascadeConditionalNode( content ) ;   
            }
           
            if( name ==="each"){
                content.push( createIterationNode(ctx,  name, refs , ctx.checkRefsName('_refs'), element, item, key) );
            }else{
                content.push( createIterationNode(ctx, name, refs , ctx.checkRefsName('_refs'), element, item, key, index ));
            }
            cmd.push(name);

        }else if( name ==="if" ){
            const node = ctx.createNode('ConditionalExpression');
            node.test = ctx.crateToken(valueArgument.expression);
            node.consequent = element;
            content.push( node );
            cmd.push(name);
        }else if( name ==="elseif" ){
            if( !prevResult || !(prevResult.cmd.includes('if') || prevResult.cmd.includes('elseif')) ){
                directive.name.error(1114, name);
            }else{
                cmd.push(name);
            }
            const node = ctx.createNode('ConditionalExpression');
            node.test = ctx.crateToken(valueArgument.expression);
            node.consequent = element;
            content.push( node );
           
        }else if( name ==="else"){
            if( !prevResult || !(prevResult.cmd.includes('if') || prevResult.cmd.includes('elseif')) ){
                directive.name.error(1114, name);
            }else{
                cmd.push(name);
            }
            content.push( element );
        }else{
            content.push( element );
        }
    }
    return {cmd,child,content};
}


function cascadeConditionalNode( elements ){
    let lastElement = elements.pop();
    while( elements.length > 0 ){
        const _last = elements.pop();
        if( _last.type ==="ConditionalExpression" ){
            _last.alternate = lastElement;
            lastElement = _last;
        }else{
            throw new Error('Invaild expression');
        }
    }
    return lastElement;
}

function makeChildren(ctx,children,data){
    const content = [];
    const part = [];
    let len = children.length;
    let index = 0;
    let last = null;
    let result = null;
    const next = ()=>{
        if( index<len ){
            const child = children[index++];
            const elem = makeDirectives(ctx, child, ctx.createToken(child) , last);
            if( child.isSlot && !child.isSlotDeclared ){
                const name = child.openingElement.name.value();
                if( child.attributes.length > 0 ){
                    data.scopedSlots.push( ctx.createPropertyNode( ctx.createIdentifierNode(name), elem.content[0]) );
                    return next();
                }
            }else if( child.isDirective ){
                let last = elem;
                let valueGroup = [];
                last.cmd.push( child.openingElement.name.value() )
                while(true){
                    const maybeChild = index < len && children[index].isDirective ? children[index++] : null;
                    const maybe=  maybeChild ? makeDirectives(ctx, maybeChild, ctx.createToken(maybeChild) , last) : null;
                    const hasIf = last.cmd.includes('if');
                    const isDirective = maybe && maybe.child.isDirective;
                    if( isDirective ){
                        maybe.cmd.push( maybeChild.openingElement.name.value() );
                    }
                    if( hasIf ){
                        if( isDirective && maybe.cmd.includes('elseif') ){
                            maybe.cmd = last.cmd.concat( maybe.cmd );
                            maybe.content = last.content.concat( maybe.content );
                        }else if( isDirective && maybe.cmd.includes('else') ){
                            valueGroup.push( cascadeConditionalNode( last.content.concat( maybe.content ) ) );
                            maybe.ifEnd = true;
                        }else{
                            if(maybe)maybe.ifEnd = true;
                            last.content.push( ctx.createLiteralNode('null','null') );
                            valueGroup.push( cascadeConditionalNode( last.content ) );
                        }
                    }else if( !last.ifEnd ){
                        valueGroup.push( ...last.content );
                    }
                    if( maybe ){
                        last = maybe;
                    }
                    if( !isDirective ){
                        break;
                    }
                }
                last.content = valueGroup.slice(0);
                last.cmd.length = 0;
                delete last.ifEnd;
                return last;
            }
            return elem;
        }
        return null;
    }
    
    while(true){
        result = next();
        if( last ){
            let value = null;
            const hasIf = last.cmd.includes('if');
            if( hasIf ){
                if( result && result.cmd.includes('elseif') ){
                    result.cmd = last.cmd.concat( result.cmd );
                    result.content = last.content.concat( result.content );
                }else if(result && result.cmd.includes('else') ){
                    value = cascadeConditionalNode( last.content.concat( result.content ) );
                    result.ifEnd = true;
                }else{
                    if(result)result.ifEnd = true;
                    last.content.push( ctx.createLiteralNode('null','null') );
                    value = cascadeConditionalNode( last.content );
                }
            }else if( !last.ifEnd ){
                value = last.content;
            }
            const complex = last.child.isJSXExpressionContainer ? !!(last.child.expression.isMemberExpression || last.child.expression.isCallExpression) : false;
            if( last.cmd.includes('each') || last.cmd.includes('for') || last.child.isSlot || last.child.isDirective || complex ){
                if( part.length > 0 ){
                    content.push( part.splice(0, part.length) );
                }
                if( value ){
                    if( Array.isArray(value) ){
                        content.push( ...value );
                    }else{
                        content.push( value );
                    }
                }
            }else{
                if( value ){
                    if( Array.isArray(value) ){
                        part.push( ...value );
                    }else{
                        part.push( value );
                    }
                }
            }
        }
        last = result;
        if( !result )break;
    }

    if( part.length > 0 ){
        content.push( part.splice(0, part.length) );
    }

    if( !content.length )return null;
   
    const segments = []
    content.forEach( item=>{
        if( Array.isArray(item) ){
            if( item.length > 1 ){
                const node = ctx.createArrayNode( item );
                node.newLine = true;
                segments.push( node );
            }else{
                segments.push( item[0] );
            }
        }else{
            segments.push( item );
        }
    });

    if( segments.length > 1 ){
        const base = segments.shift();
        return ctx.createCalleeNode( 
            ctx.createMemberNode([
                ctx.createParenthesNode(base),
                ctx.createIdentifierNode('concat')
            ]),
            segments
        );
    }

    if( segments.length===1 && segments[0].type ==='ArrayExpression' ){
        return segments[0];
    }

    const node = ctx.createArrayNode( segments );
    node.newLine = true;
    return node;
}


function createIterationNode(ctx, name, refs, refName, element, item, key, index){
  
    if( name ==="each"){
        const args = [ ctx.createIdentifierNode(item) ];
        if(key){
            args.push( ctx.createIdentifierNode(key) );
        }
        return ctx.createCalleeNode( 
            ctx.createMemberNode([
                refs,
                ctx.createIdentifierNode('map')
            ]),
            [
                ctx.createCalleeNode(
                    ctx.createMemberNode([
                        createParenthesNode(ctx,ctx.createFunctionNode(ctx=>{
                            ctx.body.push( ctx.createReturnNode( element ) );
                        }, args)),
                        ctx.createIdentifierNode('bind')
                    ]),
                    [ctx.createThisNode()]
                )
            ] 
        );
    }else{
        
        const funNode = ctx.createFunctionNode(ctx=>{
            const refArray = `_${refName}`;
            ctx.body.push(
                ctx.createDeclarationNode('var',[
                    ctx.createDeclaratorNode( ctx.createIdentifierNode(refArray) , ctx.createArrayNode() )
                ])
            );

            const ifNode = ctx.createNode('IfStatement');
            const logical = ifNode.createNode('LogicalExpression');
            logical.operator = '===';
            ifNode.condition = logical;
            ctx.body.push( ifNode );

            logical.left = ifNode.createNode('UnaryExpression');
            logical.left.operator = 'typeof';
            logical.left.prefix = true;
            logical.left.argument = logical.left.createIdentifierNode(refName);

            logical.right = logical.left.createLiteralNode('number')

            var block =  ifNode.consequent = ifNode.createNode('BlockStatement'); 
            block.body = [];
            block.body.push( 
                block.createStatementNode(
                    block.createAssignmentNode(
                        block.createDeclaratorNode(refName),
                        block.createCalleeNode(
                            block.createMemberNode([
                                block.createIdentifierNode('Array'),
                                block.createIdentifierNode('from'),
                            ]),
                            [
                                block.createObjectNode([
                                    block.createPropertyNode(
                                        block.createIdentifierNode('length'),
                                        block.createIdentifierNode(refName),
                                    )
                                ]),
                                block.createFunctionNode((ctx)=>{
                                    ctx.body.push(
                                        ctx.createReturnNode( ctx.createIdentifierNode('i') )
                                    )
                                },[
                                    block.createIdentifierNode('v'),
                                    block.createIdentifierNode('i'),
                                ])
                            ]
                        )
                    )
                )
            );

            if( index ){
                ctx.body.push(
                    ctx.createDeclarationNode('var',[
                        ctx.createDeclaratorNode(
                            ctx.createIdentifierNode(index), 
                            ctx.createLiteralNode(0,0) )
                    ])
                );
            }

            var _key = key || `_${item}Key`;
            const forNode = ctx.createNode('ForInStatement');
            ctx.body.push( forNode );

            forNode.left = forNode.createDeclarationNode('var', [
                forNode.createDeclaratorNode( _key )
            ]);
            forNode.left.inFor = true;

            forNode.right = forNode.createIdentifierNode(refName);

            var forBlock = forNode.body = forNode.createNode('BlockStatement'); 
            var forBody = forBlock.body = [];
            var refValueNode = forBlock.createMemberNode([
                forNode.createIdentifierNode(refName),
                forNode.createIdentifierNode(_key),
            ]);
            refValueNode.computed = true;

            forBody.push( 
                forBlock.createDeclarationNode( 'var', [
                    forBlock.createDeclaratorNode(
                        forBlock.createIdentifierNode(item),
                        refValueNode
                    )
                ])
            )

            forBody.push( 
                forBlock.createStatementNode(
                    forBlock.createCalleeNode( 
                        forBlock.createMemberNode([
                            forBlock.createIdentifierNode(refArray),
                            forBlock.createIdentifierNode('push'),
                        ]),
                        [
                            element 
                        ]
                    )
                )
            );

            if( index ){
                const dec = forBlock.createNode('UpdateExpression');
                dec.argument = dec.createIdentifierNode(index);
                forBody.push( dec );
            }

            ctx.body.push( ctx.createReturnNode( ctx.createIdentifierNode(refArray) ) );

        }, [ ctx.createIdentifierNode(refName) ]);

        return ctx.createCalleeNode(
            ctx.createMemberNode([ctx.createParenthesNode( funNode ), ctx.createIdentifierNode('call')]),
            [
                ctx.createThisNode(),
                refs
            ]
        );
    }
}

function getElementConfig(){
    return {
        props:[],
        attrs:[],
        on:[],
        nativeOn:[],
        slot:void 0,
        scopedSlots:[],
        domProps:[],
        key:void 0,
        ref:void 0,
        refInFor:void 0,
        tag:void 0,
        staticClass:void 0,
        class:void 0,
        show:void 0,
        staticStyle:void 0,
        style:void 0,
        hook:void 0,
        model:void 0,
        transition:[],
        directives:[]
    };
}

function createElementDeclarationNode(ctx){
    return ctx.createDeclarationNode('const', [ 
        ctx.createDeclaratorNode( 
            ctx.createIdentifierNode('createElement'),
            ctx.createCalleeNode(
                ctx.createMemberNode([
                    ctx.createThisNode(),
                    ctx.createIdentifierNode('createElement'),
                    ctx.createIdentifierNode('bind'),
                ]),
                [
                    ctx.createThisNode()
                ]
            )
        ) 
    ]);
}

function createElementRefsNode(ctx, stack){
    return ctx.createIdentifierNode('createElement', stack);
}

function createElementNode(ctx, stack, ...args){
    const node = ctx.createCalleeNode(
        createElementRefsNode(ctx, stack.openingElement ? stack.openingElement.name : stack),
        args
    );
    return node;
}

function createParenthesNode(ctx, expression){
   const node = ctx.createNode('ParenthesizedExpression');
   node.expression = expression;
   expression.parent = node;
   return node;
}

function createSlotCalleeNode(ctx, child, ...args){
    const node = ctx.createNode('LogicalExpression');
    node.left = node.createCalleeNode(
        node.createMemberNode([
            node.createThisNode(), 
            node.createIdentifierNode('slot')
        ]),
        args
    );
    node.right = child;

    node.left.parent = node;
    node.right.parent = node;
    node.operator = '||';
    return node;
}

function createSlotElement( ctx, stack , children){
    const openingElement = ctx.createToken(stack.openingElement);
    if( stack.isSlotDeclared ){
        if( stack.openingElement.attributes.length > 0 ){
            return createSlotCalleeNode(
                ctx, 
                children,
                openingElement.name, 
                ctx.createLiteralNode(true,true), 
                ctx.createLiteralNode(true,true), 
                ctx.createObjectNode( openingElement.attributes) 
            );
        }else{
            return createSlotCalleeNode(
                ctx, 
                children || ctx.createArrayNode(),
                openingElement.name,  
            );
        }
    }else{
        if( stack.openingElement.attributes.length > 0 ){
            const scope = openingElement.attributes.find( attr=>attr.name.value === 'scope' );
            const scopeName = scope && scope.value ? scope.value.value : 'scope';
            return createSlotCalleeNode(ctx,
                ctx.createCalleeNode(
                    ctx.createMemberNode([
                        createParenthesNode(ctx,ctx.createFunctionNode((ctx)=>{
                            const node = ctx.createNode('ReturnStatement');
                            node.argument = children;
                            children.parent = node;
                            ctx.body.push( node )
                        },[
                            ctx.createIdentifierNode(scopeName)
                        ])),
                        ctx.createIdentifierNode('bind')
                    ]),
                    [
                        ctx.createThisNode()
                    ]
                ),
                openingElement.name, 
                ctx.createLiteralNode(true,true),
            );
        }else{
            return createSlotCalleeNode(
                ctx, 
                children || ctx.createArrayNode(),
                openingElement.name,  
            );
        }
    }
}

function createDirectiveElement(ctx,stack,children){
    const openingElement = stack.openingElement;
    const name = openingElement.name.value();
    switch( name ){
        case 'show' :
            return children;
        case 'if' :
        case 'elseif' :
            const condition = ctx.createToken( stack.attributes[0].parserAttributeValueStack() )
            const node = ctx.createNode('ConditionalExpression')
            node.test = condition;
            node.consequent = children
            return node;
        case 'else' :
            return children;
        case 'for' :
        case 'each' :
            const attrs = stack.openingElement.attributes;
            const argument = {};
            attrs.forEach( attr=>{
                if( attr.name.value()==='name'){
                    argument[ 'refs' ] = ctx.createToken( attr.parserAttributeValueStack() );
                }else{
                    argument[ attr.name.value() ] = attr.value.value();
                }
            });
            const fun = createIterationNode(
                ctx, 
                name, 
                argument.refs, 
                ctx.checkRefsName('_refs'),
                children, 
                argument.item || 'item', 
                argument.key || 'key', 
                argument.index
            );
            return ctx.createCalleeNode(
                ctx.createMemberNode([fun,ctx.createIdentifierNode('reduce')]),
                [
                    ctx.createChunkNode('function(acc, val){return acc.concat(val)}', false),
                    ctx.createArrayNode()
                ]
            );
    } 
    return null;
}

function createHTMLElement(ctx,stack,data,children){
    const name = ctx.createLiteralNode(stack.openingElement.name.value());
    data = makeConfigObject(ctx, data);
    if( children ){
        return createElementNode(ctx, stack, name, data || ctx.createLiteralNode('null','null'), children)
    }else if(data){
        return createElementNode(ctx, stack,  name, data)
    }else{
        return createElementNode(ctx, stack, name);
    }
}

function JSXElement(ctx, stack){

    const data = getElementConfig();
    const children = stack.children.filter(child=>!( (child.isJSXScript && child.isScriptProgram) || child.isJSXStyle) );
    const childNodes = makeChildren(ctx, children, data);

    if( stack.parentStack.isSlot ){
        const name = stack.parentStack.openingElement.name.value();
        data.slot = ctx.createLiteralNode(name);
    }else if(stack.parentStack && stack.parentStack.isDirective ){
        let dName = stack.parentStack.openingElement.name.value();
        if( dName === 'show' ){
            const condition= this.stack.parentStack.openingElement.attributes[0];
            data.directives.push(
                ctx.createObjectNode([
                    ctx.createPropertyNode(ctx.createIdentifierNode('name'), ctx.createLiteralNode('show') ),
                    ctx.createPropertyNode(ctx.createIdentifierNode('value'), ctx.createToken( condition.parserAttributeValueStack() ) ),
                ])
            );
        }
    }

    var hasScopedSlot = false;
    if( stack.hasAttributeSlot ){
        const attrSlot = stack.openingElement.attributes.find( attr=>!!attr.isAttributeSlot );
        if( attrSlot ){
            const name = attrSlot.name.value();
            const scopeName = attrSlot.value ? attrSlot.value.value() : null;
            if( scopeName ){
                hasScopedSlot = true;
                data.scopedSlots.push(
                    ctx.createPropertyNode( 
                        ctx.createIdentifierNode(name), 
                        ctx.createCalleeNode(
                            ctx.createMemberNode(
                                [
                                    ctx.createParenthesNode(
                                        ctx.createFunctionNode((ctx)=>{
                                            ctx.body.push(
                                                ctx.createReturnNode( childNodes ? childNodes : ctx.createLiteralNode('null','null') )
                                            )
                                        },[ctx.createIdentifierNode(scopeName)])
                                        
                                    ),
                                    ctx.createIdentifierNode('bind')
                                ]
                            ),
                            [
                                ctx.createThisNode()
                            ]
                        )
                    )
                );
            }else{
                const name = stack.parentStack.openingElement.name.value();
                data.slot = ctx.createLiteralNode(name);
            }
        }
    }

    const spreadAttributes = [];
    createAttributes(ctx, stack, data, spreadAttributes);
    createProperties(ctx, children, data);

    if( spreadAttributes.length > 0 ){
        if( data.props.length > 0 ){
            const params = [ctx.createObjectNode() , ctx.createObjectNode(data.props), ...spreadAttributes];
            data.props = ctx.createCalleeNode(
                ctx.createMemberNode([
                    ctx.createIdentifierNode('Object'),
                    ctx.createIdentifierNode('assign')
                ]),
                params
            );
        }else{
            const params = [ctx.createObjectNode() , ...spreadAttributes];
            data.props = ctx.createCalleeNode(
                ctx.createMemberNode([
                    ctx.createIdentifierNode('Object'),
                    ctx.createIdentifierNode('assign')
                ]),
                params
            );
        }
    }

    if(stack.isSlot){
        return createSlotElement(ctx, stack, childNodes);
    }else if(stack.isDirective){
        return createDirectiveElement(ctx, stack, childNodes);
    }else{
        return createHTMLElement(ctx, stack, data, hasScopedSlot ? null : childNodes );
    }
}

JSXElement.createElementNode= createElementNode;
JSXElement.createElementRefsNode= createElementRefsNode;
JSXElement.createElementDeclarationNode= createElementDeclarationNode;
JSXElement.getElementConfig= getElementConfig;

module.exports = JSXElement;