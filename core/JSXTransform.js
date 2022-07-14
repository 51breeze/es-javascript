const Token = require("./Token");
const JSXClassBuilder = require("./JSXClassBuilder");
class JSXTransform extends Token{
    constructor(stack, ctx){
        super(stack.toString());
        this.stack = stack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.compiler = stack.compiler;
        this.module =  stack.module;
        this.plugin = ctx.plugin;
        this.name = ctx.name;
        this.platform = ctx.platform;
        this.parent = ctx;
        this.builder = ctx.builder;
    }

    makeConfig(data){
        const items = [];
        Object.entries(data).map( item=>{
            const [key, value] = item;
            if( value ){
                if( Array.isArray(value) ){
                    if( value.length > 0 ){
                        const isObject = value[0].type ==='Property';
                        if( isObject ){
                            items.push( this.createPropertyNode( this.createIdentifierNode(key), this.createObjectNode(value) ) );
                        }else{
                            items.push( this.createPropertyNode( this.createIdentifierNode(key), this.createArrayNode(value) ) );
                        }
                    }
                }else{
                    if( value.type ==="Property"){
                        items.push( value );
                    }else{
                        items.push( this.createPropertyNode( this.createIdentifierNode(key), value) );
                    }
                }
            }
        });
        return items.length > 0 ? this.createObjectNode(items) : null;
    }


    makeAttributes(stack, childNodes, data, spreadAttributes){

        const pushEvent=(name,callback, category)=>{
            const events =  data[ category ] || (data[ category ]=[]);
            const property = this.createPropertyNode(name, callback);
            if( property.key.computed ){
                property.computed = true;
                property.key.computed = false;
            }
            events.push( property );
        }

        const toFun = (item,content)=>{
            if( item.value.isJSXExpressionContainer ){
                const expr = item.value.expression;
                if( expr.isAssignmentExpression ){
                    return this.createCalleeNode(
                        this.createMemberNode([
                            this.createParenthesNode(
                                this.createFunctionNode((block)=>{
                                    block.body=[
                                        content
                                    ]
                                })
                            ),
                            this.createIdentifierNode('bind')
                        ]),
                        [
                            this.createThisNode()
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
                            this.createObjectNode([
                                this.createPropertyNode(this.createIdentifierNode('name'), this.createLiteralNode('show') ),
                                this.createPropertyNode(this.createIdentifierNode('value'), this.createToken( item.valueArgument.expression ) ),
                            ])
                        );
                    }
                }
                return;
            }else if( item.isJSXSpreadAttribute ){
                spreadAttributes && spreadAttributes.push( this.createToken( item ) );
                return;
            }else if( item.isAttributeSlot ){
                const name = item.name.value();
                const scopeName = item.value ? item.value.value() : null;
                if( scopeName ){
                    data.scopedSlots.push(
                        this.createPropertyNode( 
                            this.createIdentifierNode(name), 
                            this.createCalleeNode(
                                this.createMemberNode(
                                    [
                                        this.createParenthesNode(
                                            this.createFunctionNode((ctx)=>{
                                                ctx.body.push(
                                                    ctx.createReturnNode( childNodes ? childNodes : ctx.createLiteralNode(null) )
                                                )
                                            },[this.createIdentifierNode(scopeName)])
                                            
                                        ),
                                        this.createIdentifierNode('bind')
                                    ]
                                ),
                                [
                                    this.createThisNode()
                                ]
                            )
                        )
                    );
                }else{
                    data.slot = this.createLiteralNode(name);
                }
                return;
            }

            let value = this.createToken( item );
            if( !value )return;

            let ns = value.namespace;
            let name = value.name.name;

            if( ns && ns.includes('::') ){
                let [seg,className] = ns.split('::',2);
                ns = seg;
                const moduleClass = this.getModuleReferenceName( stack.getModuleById(className) );
                name = this.createMemberNode([
                    this.createIdentifierNode( moduleClass ),
                    name
                ], name);
                name.computed = true;
            }

            if( ns ==="@events" ){
                pushEvent( name, toFun(item,value.value), 'on')
                return;
            }else if( ns ==="@natives" ){
                pushEvent( name, toFun(item,value.value), 'nativeOn')
                return;
            }else if( ns ==="@binding" ){
                data.directives.push(
                    this.createObjectNode([
                        this.createPropertyNode(this.createIdentifierNode('name'), this.createLiteralNode('model') ),
                        this.createPropertyNode(this.createIdentifierNode('value'), value.value ),
                    ])
                );
                const funNode = this.createCalleeNode(
                    this.createMemberNode([
                        this.createParenthesNode(
                            this.createFunctionNode((block)=>{
                                block.body=[
                                    block.createStatementNode(
                                        block.createAssignmentNode(
                                            value.value,
                                            block.createChunkNode(`event && event.target && event.target.nodeType===1 ? event.target.value : event`, false)
                                        )
                                    )
                                ]
                            },[ this.createIdentifierNode('event') ])
                        ),
                        this.createIdentifierNode('bind')
                    ]),
                    [
                        this.createThisNode()
                    ]
                );
                pushEvent(this.createIdentifierNode('input') , funNode , 'on');
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
                    data.props.push( this.createPropertyNode( this.createPropertyKeyNode(propName, value.name.stack ), value.value ) );
                    return;
                }
            }

            const property = this.createPropertyNode( this.createPropertyKeyNode(propName, value.name.stack), value.value );
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

    createPropertyKeyNode(name, stack){
        if( name.includes('-') ){
            return this.createLiteralNode(name, void 0, stack);
        }
        return this.createIdentifierNode(name, stack);
    }

    makeProperties(children, data ){
        children.forEach( child=>{
            if( child.isProperty ){
                const node = this.createToken( child );
                data.props.push( this.createPropertyNode( node.name,  node.value ) );
            }else if( child.isSlot ){
                // const name = child.attributes.find( attr=>attr.name.value().toLowerCase() ==='name' );
                // const scope = child.attributes.find( attr=>attr.name.value().toLowerCase() ==='scope' );
                // const children = child.children.map( child=>this.make(child) );
            }
        });
    }

    makeDirectives(child, element, prevResult){
        if( !element )return null;
        const cmd=[];
        let content = [element];
        if( !child.directives || !(child.directives.length > 0) ){
            return {cmd,child,content};
        }
        const directives = child.directives.slice(0).sort( (a,b)=>{
            const name = b.name.value();
            return name === 'each' || name ==="for" ? -1 : 0;
        });

        while( directives.length > 0){
            const directive = directives.shift();
            const name = directive.name.value();
            const valueArgument = directive.valueArgument;
            if( name ==="each" || name ==="for" ){
                let refs = this.createToken(valueArgument.expression);
                let item = valueArgument.declare.item;
                let key = valueArgument.declare.key;
                let index = valueArgument.declare.index;
                if( cmd.includes('if') ){
                    cmd.pop();
                    content.push( this.createLiteralNode(null)  );
                    content[0] = this.cascadeConditionalNode( content );
                }
                if( name ==="each"){
                    content[0] = this.createIterationNode(name, refs , this.checkRefsName('_refs'), content[0], item, key);
                }else{
                    content[0] = this.createIterationNode(name, refs , this.checkRefsName('_refs'), content[0], item, key, index );
                }
                cmd.push(name);

            }else if( name ==="if" ){
                const node = this.createNode('ConditionalExpression');
                node.test = this.createToken(valueArgument.expression);
                node.consequent = content[0];
                content[0] = node;
                cmd.push(name);
            }else if( name ==="elseif" ){
                if( !prevResult || !(prevResult.cmd.includes('if') || prevResult.cmd.includes('elseif')) ){
                    directive.name.error(1114, name);
                }else{
                    cmd.push(name);
                }
                const node = this.createNode('ConditionalExpression');
                node.test = this.createToken(valueArgument.expression);
                node.consequent = content[0];
                content[0]=node;
            }else if( name ==="else"){
                if( !prevResult || !(prevResult.cmd.includes('if') || prevResult.cmd.includes('elseif')) ){
                    directive.name.error(1114, name);
                }else{
                    cmd.push(name);
                }
            }
        }
        return {cmd,child,content};
    }

    cascadeConditionalNode( elements ){
        if( elements.length < 2 ){
            throw new Error('Invaild expression');
        }
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

    makeChildren(children,data){
        const content = [];
        const part = [];
        let len = children.length;
        let index = 0;
        let last = null;
        let result = null;
        const next = ()=>{
            if( index<len ){
                const child = children[index++];
                const elem = this.makeDirectives(child, this.createToken(child) , last) || next();
                if( child.isSlot && !child.isSlotDeclared ){
                    const name = child.openingElement.name.value();
                    if( child.attributes.length > 0 ){
                        data.scopedSlots.push( this.createPropertyNode( this.createIdentifierNode(name), elem.content[0]) );
                        return next();
                    }
                }else if( child.isDirective ){
                    let last = elem;
                    let valueGroup = [];
                    last.cmd.push( child.openingElement.name.value() )
                    while(true){
                        const maybeChild = index < len && children[index].isDirective ? children[index++] : null;
                        const maybe=  maybeChild ? this.makeDirectives(maybeChild, this.createToken(maybeChild) , last) : null;
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
                                valueGroup.push( this.cascadeConditionalNode( last.content.concat( maybe.content ) ) );
                                maybe.ifEnd = true;
                            }else{
                                if(maybe)maybe.ifEnd = true;
                                last.content.push( this.createLiteralNode(null) );
                                valueGroup.push( this.cascadeConditionalNode( last.content ) );
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
                    last.content = valueGroup;
                    last.cmd.length = 0;
                    delete last.ifEnd;
                    return last;
                }
                return elem;
            }
            return null;
        }

        const push = (data, value)=>{
            if( value ){
                if( Array.isArray(value) ){
                    data.push( ...value );
                }else{
                    data.push( value );
                }
            }
        }

        var hasComplex = false;
        
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
                        value = this.cascadeConditionalNode( last.content.concat( result.content ) );
                        result.ifEnd = true;
                    }else{
                        if(result)result.ifEnd = true;
                        last.content.push( this.createLiteralNode(null) );
                        value = this.cascadeConditionalNode( last.content );
                    }
                }else if( !( last.ifEnd && last.cmd.includes('else') ) ) {
                    value = last.content;
                }

                const complex = last.child.isJSXExpressionContainer ? !!(last.child.expression.isMemberExpression || last.child.expression.isCallExpression) : false;
                if( last.cmd.includes('each') || last.cmd.includes('for') || last.child.isSlot || last.child.isDirective || complex ){
                    hasComplex = true;
                }
                push(content, value);
            }
            last = result;
            if( !result )break;
        }

        if( !content.length )return null;
        if( hasComplex ){
            var base =  content.length > 1 ? content.shift() : this.createArrayNode();
            if( base.type !== 'ArrayExpression' ){
                base = this.createArrayNode([base]);
                base.newLine = true;
            }
            const node = this.createCalleeNode( 
                this.createMemberNode([
                    base,
                    this.createIdentifierNode('concat')
                ]),
                content.reduce(function(acc, val){
                    if( val.type === 'ArrayExpression' ){
                        return acc.concat( ...val.elements );
                    }else{
                        return acc.concat(val)
                    }
                },[])
            );
            node.newLine = true;
            node.indentation = true; 
            return node;
        }
        const node = this.createArrayNode( content );
        if( content.length > 1 || !(content[0].type ==="Literal" || content[0].type ==="Identifier") ){
            node.newLine = true;
        }
        return node;
    }

    createForInNode(refName, element, item, key, index){
        return this.createFunctionNode(ctx=>{
            const refArray = `_${refName}`;
            ctx.body.push(
                ctx.createDeclarationNode('var',[
                    ctx.createDeclaratorNode( ctx.createIdentifierNode(refArray) , ctx.createArrayNode() )
                ])
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

            const _key = key || `_${item}Key`;
            const forNode = ctx.createNode('ForInStatement');
            ctx.body.push( forNode );

            forNode.left = forNode.createDeclarationNode('var', [
                forNode.createDeclaratorNode( _key )
            ]);
            forNode.left.inFor = true;
            forNode.right = forNode.createIdentifierNode(refName);

            const forBlock = forNode.body = forNode.createNode('BlockStatement'); 
            const forBody = forBlock.body = [];
            const refValueNode = forBlock.createMemberNode([
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
                dec.operator='++';
                forBody.push( forBlock.createStatementNode(dec) );
            }

            ctx.body.push( ctx.createReturnNode( ctx.createIdentifierNode(refArray) ) );

        }, [ this.createIdentifierNode(refName) ]);
    }

    createEachNode(element, args){
        return this.createCalleeNode(
            this.createMemberNode([
                this.createParenthesNode(this.createFunctionNode(ctx=>{
                    ctx.body.push( ctx.createReturnNode( element ) );
                }, args)),
                this.createIdentifierNode('bind')
            ]),
            [this.createThisNode()]
        )
    }

    createIterationNode(name, refs, refName, element, item, key, index){
    
        if( name ==="each"){
            const args = [ this.createIdentifierNode(item) ];
            if(key){
                args.push( this.createIdentifierNode(key) );
            }
            return this.createCalleeNode( 
                this.createMemberNode([
                    refs,
                    this.createIdentifierNode('map')
                ]),
                [
                    this.createEachNode(element, args)
                ] 
            );
        }else{
            return this.createCalleeNode(
                this.createMemberNode([
                    this.createParenthesNode( 
                        this.createForInNode(refName, element, item, key, index) 
                    ), this.createIdentifierNode('call')
                ]),
                [
                    this.createThisNode(),
                    refs
                ]
            );
        }
    }

    createRenderNode(stack, child){
        const handle = this.createElementHandleNode(stack);
        const node = this.createMethodNode('render', (ctx)=>{
            handle.parent = ctx;
            ctx.body = [
                handle,
                ctx.createReturnNode( child )
            ]
        });
        node.static = false;
        node.modifier = 'public';
        node.kind = 'method';
        return node;
    }

    createClassNode(stack, renderMethod, initProperties){
        const obj = new JSXClassBuilder(stack, this, 'ClassDeclaration');
        if(renderMethod){
            obj.members.push( renderMethod )
        }
        if( initProperties && initProperties.length>0 ){
            obj.initProperties.push( ...initProperties );
        }
        obj.create();
        return obj;
    }

    getElementConfig(){
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

    isWebComponent(stack){
        const module = stack.module;
        if( this.compilation.JSX || (module && ( stack.isModuleForWebComponent( module ) || stack.isModuleForSkinComponent(module) ) )){
            return true;
        }
        return false
    }

    createElementHandleNode(stack){
        if( this.isWebComponent(stack) ){
            return this.createDeclarationNode('const', [ 
                this.createDeclaratorNode( 
                    this.createIdentifierNode('createElement'),
                    this.createCalleeNode(
                        this.createMemberNode([
                            this.createThisNode(),
                            this.createIdentifierNode('createElement'),
                            this.createIdentifierNode('bind'),
                        ]),
                        [
                            this.createThisNode()
                        ]
                    )
                ) 
            ]);
        }else{
            return this.createDeclarationNode('const', [ 
                this.createDeclaratorNode( 
                    this.createIdentifierNode('createElement'),
                    this.createChunkNode('arguments[0]',false)
                ) 
            ]);
        }
    }

    createElementRefsNode(stack){
        return this.createIdentifierNode('createElement', stack);
    }

    createElementNode(stack, ...args){
        const node = this.createCalleeNode(
            this.createElementRefsNode(stack.openingElement ? stack.openingElement.name : stack),
            args
        );
        return node;
    }

    createSlotCalleeNode(child, ...args){
        const node = this.createNode('LogicalExpression');
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

    makeSlotElement(stack , children){
        const openingElement = this.createToken(stack.openingElement);
        if( stack.isSlotDeclared ){
            if( stack.openingElement.attributes.length > 0 ){
                return this.createSlotCalleeNode(
                    children,
                    openingElement.name, 
                    this.createLiteralNode(true,true), 
                    this.createLiteralNode(true,true), 
                    this.createObjectNode( openingElement.attributes)
                );
            }else{
                return this.createSlotCalleeNode(
                    children || this.createArrayNode(),
                    openingElement.name,  
                );
            }
        }else{
            if( stack.openingElement.attributes.length > 0 ){
                const scope = stack.openingElement.attributes.find( attr=>attr.name.value() === 'scope' );
                const scopeName = scope && scope.value ? scope.value.value() : 'scope';
                return this.createSlotCalleeNode(
                    this.createCalleeNode(
                        this.createMemberNode([
                            this.createParenthesNode(this.createFunctionNode((ctx)=>{
                                const node = ctx.createNode('ReturnStatement');
                                node.argument = children;
                                children.parent = node;
                                ctx.body.push( node )
                            },[
                                this.createIdentifierNode(scopeName)
                            ])),
                            this.createIdentifierNode('bind')
                        ]),
                        [
                            this.createThisNode()
                        ]
                    ),
                    openingElement.name, 
                    this.createLiteralNode(true),
                );
            }else{
                return this.createSlotCalleeNode(
                    children || this.createArrayNode(),
                    openingElement.name,  
                );
            }
        }
    }

    makeDirectiveElement(stack,children){
        const openingElement = stack.openingElement;
        const name = openingElement.name.value();
        switch( name ){
            case 'show' :
                return children;
            case 'if' :
            case 'elseif' :
                const condition = this.createToken( stack.attributes[0].parserAttributeValueStack() )
                const node = this.createNode('ConditionalExpression')
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
                        argument[ 'refs' ] = this.createToken( attr.parserAttributeValueStack() );
                    }else{
                        argument[ attr.name.value() ] = attr.value.value();
                    }
                });
                const fun = this.createIterationNode(
                    name, 
                    argument.refs, 
                    this.checkRefsName('_refs'),
                    children, 
                    argument.item || 'item',
                    argument.key || 'key', 
                    argument.index
                );
                return this.createCalleeNode(
                    this.createMemberNode([fun,this.createIdentifierNode('reduce')]),
                    [
                        this.createChunkNode('function(acc, val){return acc.concat(val)}', false),
                        this.createArrayNode()
                    ]
                );
        } 
        return null;
    }

    makeHTMLElement(stack,data,children){
        var name = null;
        if( stack.isComponent ){
            if( stack.jsxRootElement === stack && stack.parentStack.isProgram ){
                name = this.createLiteralNode("div");
            }else{
                name = this.createIdentifierNode( this.getModuleReferenceName( stack.description() ) );
            }
        }else{
            name = this.createLiteralNode(stack.openingElement.name.value(), void 0, stack.openingElement.name);
        }

        data = this.makeConfig(data);
        if( children ){
            return this.createElementNode(stack, name, data || this.createLiteralNode('null','null'), children);
        }else if(data){
            return this.createElementNode(stack, name, data);
        }else{
            return this.createElementNode(stack, name);
        }
    }

    create(stack){

        const data = this.getElementConfig();
        const children = stack.children.filter(child=>!( (child.isJSXScript && child.isScriptProgram) || child.isJSXStyle) );
        const childNodes =this.makeChildren(children, data);

        if( stack.parentStack.isSlot ){
            const name = stack.parentStack.openingElement.name.value();
            data.slot = this.createLiteralNode(name);
        }else if(stack.parentStack && stack.parentStack.isDirective ){
            let dName = stack.parentStack.openingElement.name.value();
            if( dName === 'show' ){
                const condition= stack.parentStack.openingElement.attributes[0];
                data.directives.push(
                    this.createObjectNode([
                        this.createPropertyNode(this.createIdentifierNode('name'), this.createLiteralNode('show') ),
                        this.createPropertyNode(this.createIdentifierNode('value'), this.createToken( condition.parserAttributeValueStack() ) ),
                    ])
                );
            }
        }

        var hasScopedSlot = false;
        if( stack.hasAttributeSlot ){
            const attrSlot = stack.openingElement.attributes.find( attr=>!!attr.isAttributeSlot );
            if( attrSlot ){
                hasScopedSlot = !!attrSlot.value;
            }
        }

        const spreadAttributes = [];
        this.makeAttributes(stack, childNodes, data, spreadAttributes);
        this.makeProperties(children, data);

        if( spreadAttributes.length > 0 ){
            if( data.props.length > 0 ){
                const params = [
                    this.createObjectNode(), 
                    this.createObjectNode(data.props),
                    ...spreadAttributes
                ];
                data.props = this.createCalleeNode(
                    this.createMemberNode([
                        this.createIdentifierNode('Object'),
                        this.createIdentifierNode('assign')
                    ]),
                    params
                );
            }else{
                const params = [this.createObjectNode() , ...spreadAttributes];
                data.props = this.createCalleeNode(
                    this.createMemberNode([
                        this.createIdentifierNode('Object'),
                        this.createIdentifierNode('assign')
                    ]),
                    params
                );
            }
        }

        const isRoot = stack.jsxRootElement === stack;
        var nodeElement = null;
        if(stack.isSlot){
            nodeElement = this.makeSlotElement(stack, childNodes);
        }else if(stack.isDirective){
            nodeElement = this.makeDirectiveElement(stack, childNodes);
        }else{
            nodeElement = this.makeHTMLElement(stack, data, hasScopedSlot ? null : childNodes );
        }

        if( isRoot ){
            if( stack.compilation.JSX && stack.parentStack.isProgram ){
                const initProperties = data.props.map( property=>{
                    return this.createStatementNode(
                        this.createAssignmentNode(
                            this.createMemberNode([
                                this.createThisNode(),
                                this.createIdentifierNode( property.name.value )
                            ]),
                            property.value,
                        )
                    )
                });
                const renderMethod = this.createRenderNode(stack, nodeElement );
                nodeElement = this.createClassNode(stack, renderMethod, initProperties);
            }else{
                const block =  this.getParentByType( ctx=>{
                    return ctx.type === "BlockStatement" && ctx.parent.type ==="MethodDefinition"
                });
                if( block && !block.existCreateElementHandle ){
                    block.existCreateElementHandle = true;
                    block.body.unshift( this.createElementHandleNode(stack) );
                }
            }
        }
        return nodeElement;
    }
}

module.exports = JSXTransform;