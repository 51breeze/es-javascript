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

    get directiveMaps(){
        const map = this._directiveMaps;
        if( map )return map;
        return this._directiveMaps=new Map();
    }

    getComponentDirectiveForDefine( stack ){
        if( !stack )return null;
        const map = this.directiveMaps;
        if( map.has( stack ) ){
            return map.get( stack );
        }
        let desc = stack.description();
        if( desc && (desc.isMethodDefinition || desc.isPropertyDefinition) && desc.module ){
            desc = desc.module;
        }
        let result = null;
        if( desc && desc.isModule ){
            const stack = desc.compilation.getStackByModule(desc)
            if( stack ){
                const res = stack.findAnnotation(stack, (annotation)=>{
                    const name = annotation.name.toLowerCase();
                    if( name ==="define" ){
                        const args = annotation.getArguments();
                        const arg = args[0];
                        if( arg && arg.value.toLowerCase() === 'directives' ){
                            this.addDepend( desc );
                            if( args.length > 1 ){
                                return [desc,args[1].value,annotation];
                            }else{
                                return [desc,desc.getName('-'),annotation];
                            }
                        }
                    }
                });
                if( res ){
                    this.addDepend(desc)
                    result = res[0];
                }
            }
        }
        map.set(stack, result);
        return result;
    }

    makeConfig(data, stack){
        const items = [];
        Object.entries(data).map( item=>{
            const [key, value] = item;
            if( value ){
                if( Array.isArray(value) ){
                    if( value.length > 0 ){
                        const type = value[0].type;
                        const isObject = type ==='Property' || type ==='JSXSpreadAttribute' || type ==='SpreadElement';
                        if( isObject ){
                            items.push( this.createPropertyNode( this.createIdentifierNode(key), this.createObjectNode(value) ) );
                        }else{
                            items.push( this.createPropertyNode( this.createIdentifierNode(key), this.createArrayNode(value) ) );
                        }
                    }
                }else{
                    if( value.type ==="Property" ){
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

        const forStack = stack.getParentStack(stack=>{
            return stack.scope.isForContext || !(stack.isJSXElement || stack.isJSXExpressionContainer)
        },true);
        const inFor = forStack && forStack.scope && forStack.scope.isForContext ? true : false;

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
                    }else if(name === 'custom'){
                        this.createAttriubeCustomDirective(item, data)
                    }
                }
                return;
            }else if( item.isJSXSpreadAttribute ){
                if( item.argument ){
                    const node = this.createNode(item.argument, 'SpreadElement')
                    node.argument = node.createToken(item.argument)
                    data.props.push(node);
                }
                return;
            }else if( item.isAttributeSlot ){
                const name = item.name.value();
                const scopeName = item.value ? item.value.value() : null;
                if( scopeName ){
                    // data.scopedSlots.push(
                    //     this.createPropertyNode( 
                    //         this.createIdentifierNode(name), 
                    //         this.createCalleeNode(
                    //             this.createMemberNode(
                    //                 [
                    //                     this.createParenthesNode(
                    //                         this.createFunctionNode((ctx)=>{
                    //                             ctx.body.push(
                    //                                 ctx.createReturnNode( childNodes ? childNodes : ctx.createLiteralNode(null) )
                    //                             )
                    //                         },[this.createIdentifierNode(scopeName)])
                                            
                    //                     ),
                    //                     this.createIdentifierNode('bind')
                    //                 ]
                    //             ),
                    //             [
                    //                 this.createThisNode()
                    //             ]
                    //         )
                    //     )
                    // );
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
                case "tag" :
                case "staticStyle" :
                case "staticClass" :
                    data[name] = property
                    break;
                case "innerHTML" :
                    data.domProps.push( property );
                    break;
                case "ref" :
                    data.refInFor = this.createLiteralNode( inFor );
                    data[name] = property
                break;
                case "value" :
                default:
                    data.attrs.push( property );
            }
        });

        // if( !data.key ){
        //     if( inFor ){

        //     }else if(stack.parentStack){
        //         const children = stack.parentStack.childrenStack;
        //         if( children ){
        //             const index = children.indexOf( stack );
        //             if( index >=0 ){
        //                 data.key = this.createPropertyNode( this.createIdentifierNode('key'),  this.createLiteralNode(index) );
        //             }
        //         }
        //     }
        // }
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
            const bb = b.name.value().toLowerCase();
            const aa = a.name.value().toLowerCase();
            const v1 = bb === 'each' || bb ==="for" ? 1 : 0;
            const v2 = aa === 'each' || aa ==="for" ? 1 : 0;
            return v1 - v2;
        });

        while( directives.length > 0){
            const directive = directives.shift();
            const name = directive.name.value().toLowerCase();
            const valueArgument = directive.valueArgument;
            if( name ==="each" || name ==="for" ){
                let refs = this.createToken(valueArgument.expression);
                let item = valueArgument.declare.item;
                let key = valueArgument.declare.key || 'key';
                let index = valueArgument.declare.index;
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
                    console.log( prevResult.child.isDirective , prevResult.child.openingElement.name.value() )
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

        const hasScopedSlot = ( stack )=>{
            if( stack.hasAttributeSlot ){
                return stack.openingElement.attributes.find( attr=>!!(attr.isAttributeSlot && attr.value) );
            }
            return false;
        }

        const next = ()=>{
            if( index<len ){
                const child = children[index++];
                const elem = this.makeDirectives(child, this.createToken(child) , last) || next();
                const attrScopeSlot = hasScopedSlot( child );
                if( (child.isSlot || attrScopeSlot) && !child.isSlotDeclared){
                    if( attrScopeSlot ){
                        const name = attrScopeSlot.name.value();
                        data.scopedSlots.push( this.createPropertyNode( this.createIdentifierNode(name), elem.content[0]) );
                        return next();
                    }else{
                        const name = child.openingElement.name.value();
                        if( child.attributes.length > 0 ){
                            data.scopedSlots.push( this.createPropertyNode( this.createIdentifierNode(name), elem.content[0]) );
                            return next();
                        }
                    }
                }else if( child.isDirective ){
                    let dName = child.openingElement.name.value().toLowerCase();
                    if( dName !=="custom" ){
                        elem.cmd.push( dName );
                    }
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
                if( last.cmd.includes('each') || last.cmd.includes('for') || last.child.isSlot || complex ){
                    hasComplex = true;
                }else if( last.child.isDirective ){
                    const dName = last.child.openingElement.name.value().toLowerCase();
                    if( dName !=="custom" ){
                        hasComplex = true;
                    }
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
        const node = this.createArrowFunctionNode([this.createIdentifierNode(refName)]);
        const createBlock = ctx=>{
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
                            ctx.createLiteralNode(0,0)
                        )
                    ])
                );
            }
            const block = ctx.createNode('BlockStatement'); 
            const body = block.body = [];
            const params = [ctx.createIdentifierNode(item)];
            if( key ){
                params.push(ctx.createIdentifierNode(key))
            }

            const node = ctx.createArrowFunctionNode(params, block);
            if( element.type ==="ArrayExpression" && element.elements.length === 1){
                element = element.elements[0];
            }
            if( element.type ==="ArrayExpression" ){
                body.push( 
                    block.createStatementNode(
                        block.createAssignmentNode( 
                            block.createIdentifierNode(refArray) ,
                            block.createCalleeNode( 
                                block.createMemberNode([
                                    block.createIdentifierNode(refArray),
                                    block.createIdentifierNode('concat'),
                                ]),
                                [
                                    element 
                                ]
                            )
                        )
                    )
                );
            }else{
                body.push( 
                    block.createStatementNode(
                        block.createCalleeNode( 
                            block.createMemberNode([
                                block.createIdentifierNode(refArray),
                                block.createIdentifierNode('push'),
                            ]),
                            [
                                element 
                            ]
                        )
                    )
                );
            }
            if( index ){
                const dec = block.createNode('UpdateExpression');
                dec.argument = dec.createIdentifierNode(index);
                dec.operator='++';
                body.push( block.createStatementNode(dec) );
            }
            ctx.body.push(
                ctx.createStatementNode(
                    ctx.createCalleeNode(
                        ctx.createMemberNode(['System','forEach']),
                        [
                            ctx.createIdentifierNode(refName),
                            node
                        ]
                    )
                )
            );
            ctx.body.push( ctx.createReturnNode( ctx.createIdentifierNode(refArray) ) );
            this.addDepend( this.builder.getGlobalModuleById('System') );
        };
        node.body = node.createNode('BlockStatement');
        node.body.body=[];
        createBlock( node.body )
        return node;
    }

    createForMapNode(object, element, item, key, index){
        const params = [this.createIdentifierNode(item)];
        if( key ){
            params.push(this.createIdentifierNode(key))
        }

        if( index ){
            params.push(this.createIdentifierNode(index))
        }

        if( element.type ==="ArrayExpression" && element.elements.length === 1){
            element = element.elements[0];
        }

        const node = this.createArrowFunctionNode(params, element);
        const System = this.builder.getGlobalModuleById('System')
        this.addDepend( System );
        return this.createCalleeNode(
            this.createMemberNode([this.checkRefsName( this.getModuleReferenceName(System) ),'forMap']),
            [
                object,
                node
            ]
        );
    }

    createEachNode(element, args){
        return this.createArrowFunctionNode(args,element);
    }

    createIterationNode(name, refs, refName, element, item, key, index){
    
        if( name ==="each"){
            const args = [ this.createIdentifierNode(item) ];
            if(key){
                args.push( this.createIdentifierNode(key) );
            }
            if( element.type ==='ArrayExpression' && element.elements.length === 1){
                element =  element.elements[0];
            }
            const node = this.createCalleeNode( 
                this.createMemberNode([
                    refs,
                    this.createIdentifierNode('map')
                ]),
                [
                    this.createEachNode(element, args)
                ] 
            );
            if( element.type ==='ArrayExpression' ){
                return this.createCalleeNode( 
                    this.createMemberNode([
                        node,
                        this.createIdentifierNode('reduce')
                    ]),
                    [
                        this.createArrowFunctionNode([
                            this.createIdentifierNode('acc'),
                            this.createIdentifierNode('item')
                        ],  this.createCalleeNode( 
                            this.createMemberNode([
                                this.createIdentifierNode('acc'),
                                this.createIdentifierNode('concat')
                            ]),
                            [
                                this.createIdentifierNode('item')
                            ] 
                        )),
                        this.createArrayNode()
                    ] 
                );
            }
            return node;
        }else{
            return this.createForMapNode(refs,element, item, key, index)
            // return this.createCalleeNode(
            //     this.createParenthesNode( 
            //         this.createForInNode(refName, element, item, key, index) 
            //     ),
            //     [
            //         refs
            //     ]
            // );
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
                    this.createElementRefsNode(null),
                    this.createCalleeNode(
                        this.createMemberNode([
                            this.createThisNode(),
                            this.createIdentifierNode('createVNode'),
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
                    this.createElementRefsNode(null),
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

    createSlotCalleeNode(stack,child, ...args){
        if(stack.isSlotDeclared){
            return this.createCalleeNode(
                this.createMemberNode([
                    this.createThisNode(), 
                    this.createIdentifierNode('slot')
                ]),
                child ? args.concat( child ) : args,
                stack
            );
        }else{
            return child || this.createArrowFunctionNode([],this.createArrayNode())
        }
    }

    makeSlotElement(stack , children, scopedSlot){
       
        let attributes = [];
        let name = null;
        if( scopedSlot ){
            if( scopedSlot.value ){
                attributes.push( this.createIdentifierNode(scopedSlot.value.value(), scopedSlot.value) );
            }
            name = this.createLiteralNode(scopedSlot.name.value())
        }else{
            attributes = stack.openingElement.attributes;
            name = this.createLiteralNode( stack.openingElement.name.value() );
            
            if( stack.openingElement.attributes.length > 0 ){
                if( stack.isSlotDeclared ){
                    attributes = stack.openingElement.attributes.map( attr=>attr.value ? this.createToken(attr.value) : this.createLiteralNode(null) )
                }else{
                    const slotName = stack.openingElement.name.value();
                    const declareSlot = stack.getSlotDescription(slotName);
                    let declareArgs = [];
                    if( declareSlot ){
                        if( declareSlot.isJSXElement && declareSlot.openingElement.attributes.length > 0){
                            declareArgs = declareSlot.openingElement.attributes.map( attr=>attr.name.value() );
                        }else if( declareSlot.isAnnotation && declareSlot.args && declareSlot.args.length > 0 ){
                            declareArgs = declareSlot.args.map( attr=>attr.name );
                        }

                        const mapNodes = {};
                        const attributeNodes = stack.openingElement.attributes.map( attr=>{
                            const stack = attr.value || attr.name;
                            const value = stack.value();
                            const name = attr.name.value();
                            const node = this.createIdentifierNode(value,stack);
                            mapNodes[name] = node;
                            return node;
                        });

                        if( declareArgs.length > 1 ){
                            attributes = declareArgs.map( name=>{
                                const attr = mapNodes[name];
                                if( attr ){
                                    return attr;
                                }else{
                                    return null;
                                }
                            });
                            while( true ){
                                let len = attributes.length;
                                if( len > 0 && !attributes[ len-1 ] ){
                                    attributes.pop();
                                }else{
                                    break;
                                }
                            }
                            attributes = attributes.map( (attr,index)=>attr ? attr : this.createIdentifierNode(`__$$`+index) );
                        }else{
                            attributes = attributeNodes;
                        }

                    }else{
                        attributes = stack.openingElement.attributes.map( attr=>{
                            const stack = attr.value || attr.name;
                            return this.createIdentifierNode(stack.value(),stack);
                        });
                    }
                }
            }
        }

        if( stack.isSlotDeclared ){
            if( attributes.length > 0 ){
                const params = stack.openingElement.attributes.map( attr=>this.createToken(attr.name) );
                return this.createSlotCalleeNode(
                    stack,
                    children ? this.createArrowFunctionNode(params,children) : null,
                    name, 
                    this.createLiteralNode(true),
                    this.createArrayNode(attributes)
                );
            }else{
                return this.createSlotCalleeNode(
                    stack,
                    children ? this.createArrowFunctionNode([],children) : null,
                    name
                );
            }
        }else{
            if( attributes.length > 0 ){
                return this.createSlotCalleeNode(
                    stack,
                    this.createArrowFunctionNode(attributes, children),
                    name, 
                    this.createLiteralNode(true),
                );
            }else{
                return this.createSlotCalleeNode(
                    stack,
                    children ? this.createArrowFunctionNode([],children) : null,
                    name
                );
            }
        }
    }

    makeDirectiveElement(stack, children){
        const openingElement = stack.openingElement;
        const name = openingElement.name.value().toLowerCase();
        switch( name ){
            case 'custom' :
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
                fun.isForNode = true;
                return fun;
        } 
        return null;
    }

    makeHTMLElement(stack,data,children){
        var name = null;
        if( stack.isComponent ){
            if( stack.jsxRootElement === stack && stack.parentStack.isProgram ){
                name = this.createLiteralNode("div");
            }else{
                const desc = stack.description();
                if( desc.isModule && desc.isClass ){
                    this.addDepend(desc)
                    name = this.createIdentifierNode( this.getModuleReferenceName( desc ) );
                }else{
                    name = this.createIdentifierNode(stack.openingElement.name.value(), stack.openingElement.name);
                }
            }
        }else{
            name = this.createLiteralNode(stack.openingElement.name.value(), void 0, stack.openingElement.name);
        }

        data = this.makeConfig(data, stack);
        if( children ){
            return this.createElementNode(stack, name, data || this.createLiteralNode(null), children);
        }else if(data){
            return this.createElementNode(stack, name, data);
        }else{
            return this.createElementNode(stack, name);
        }
    }

    createAttriubeCustomDirective( attributeDirective, data ){
        const item = attributeDirective;
        if( item.value ){
            const type = item.value.type();
            const props = [];
            let directive = null;
            let direName = null;
            let direModule = null;
            if( type && type.isLiteralObjectType && type.properties){
                type.properties.forEach( (item,key)=>{
                    const name = key;
                    const value = item.init;
                    if( name ==='name' ){
                        if( value ){
                            if( value.isLiteralType ){
                                directive = this.createToken(value);
                            }else{
                                directive = this.getComponentDirectiveForDefine( value );
                                if( directive ){
                                    [direModule, direName,] = directive;
                                    direName = this.createLiteralNode(direName);
                                    const desc = value.description();
                                    if( desc && (desc.isMethodDefinition || desc.isPropertyDefinition)){
                                        directive = this.createToken(value);
                                    }else{
                                        directive = this.createIdentifierNode( this.getModuleReferenceName(direModule) );
                                    }
                                }
                            }
                            if( directive ){
                                if( direName ){
                                    props.push( this.createPropertyNode('name', direName) );
                                    props.push( this.createPropertyNode('directiveClass', directive) );
                                }else{
                                    props.push( this.createPropertyNode('name', directive) );
                                } 
                            }else{
                                props.push( this.createPropertyNode('name', this.createToken(value) ) );
                            }
                        }else{
                            const range = stack.compilation.getRangeByNode( item.key.node );
                            console.warn(`No named value directive was specified.\r\n at ${stack.file}(${range.end.line}:${range.end.column})`);
                        }
                    }else if(value){
                        props.push( this.createPropertyNode(this.createPropertyKeyNode(name), this.createToken(value) ) );
                    }
                });
            }

            const Component = this.builder.getModuleById('web.components.Component');
            const object = props.length > 0 && directive ? this.createObjectNode(props) : this.createToken( item.parserAttributeValueStack() );
            this.addDepend(Component);

            data.directives.push(this.createCalleeNode(
                this.createMemberNode([
                    this.createIdentifierNode( this.getModuleReferenceName(Component) ),
                    this.createIdentifierNode('resolveDirective')
                ]),
                [
                    object,
                    this.createThisNode()
                ]
            ));
            
        }else{
            console.error(`Custom directive expression is cannot empty.\r\n at ${stack.file}(${range.end.line}:${range.end.column})`);
        }
    }

    createCustomDirective(stack, data, callback){  
        const props = [];
        let directive = null;
        let has = false;
        let modifier = null;
        stack.openingElement.attributes.forEach( attr=>{
            const name = attr.name.value()
            const lower = name.toLowerCase();
            if( lower ==='name'){
                let value = attr.value;
                if( value.isJSXExpressionContainer ){
                    value = value.expression;
                }
                if(value){
                    has = true;
                    let direName = null;
                    let direModule = null;
                    if( value.isLiteral ){
                        directive = this.createToken(value);
                    }else{
                        directive = this.getComponentDirectiveForDefine( attr.value );
                        if( directive ){
                            [direModule, direName,] = directive;
                            direName = this.createLiteralNode(direName);
                            const desc = value.description();
                            if( desc && (desc.isMethodDefinition || desc.isPropertyDefinition)){
                                directive = this.createToken(value);
                            }else{
                                directive = this.createIdentifierNode( this.getModuleReferenceName(direModule) );
                            }
                        }
                    }
                    if( directive ){
                        if( direName ){
                            props.push( this.createPropertyNode('name', direName) );
                            props.push( this.createPropertyNode('directiveClass', directive) );
                        }else{
                            props.push( this.createPropertyNode('name', directive) );
                        }
                    }else{
                        props.push( this.createPropertyNode('name', this.createToken(attr.value) ) );
                    }
                }else{
                    const range = stack.compilation.getRangeByNode( attr.name.node );
                    console.warn(`No named value directive was specified.\r\n at ${stack.file}(${range.end.line}:${range.end.column})`);
                }
            }else if( lower==="value" ){
                props.push( this.createPropertyNode('value', attr.value ? this.createToken(attr.value) : this.createLiteralNode(false) ) );
            }else if(lower === 'modifier'){
                modifier = attr.value ? this.createToken(attr.value) : this.createObjectNode();
                return;
            }else{
                const property = this.createPropertyNode(this.createPropertyKeyNode(name), attr.value ? this.createToken(attr.value) : this.createLiteralNode(true) );
                property.isInheritDirectiveProp = true
                if( attr.isMemberProperty ){
                    property.isInheritDirectiveProp = true
                    data.props.push( property );
                }else{
                    property.isInheritDirectiveAttr = true
                    data.attrs.push( property );
                }
                if(callback){
                    callback( property );
                }
            }
        });

        if( has ){

            if( modifier ){
                props.push(
                    this.createPropertyNode(
                        this.createPropertyKeyNode('modifiers'),
                        modifier
                    )
                );
            }

            const Component = this.builder.getModuleById('web.components.Component');
            const object = this.createObjectNode(props); 
            this.addDepend(Component);
            const node = this.createCalleeNode(
                this.createMemberNode([
                    this.createIdentifierNode( this.getModuleReferenceName(Component) ),
                    this.createIdentifierNode('resolveDirective')
                ]),
                [
                    object,
                    this.createThisNode()
                ]
            );
            node.isInheritComponentDirective = true;
            data.directives.push(node);
        }

        if( stack.parentStack && stack.parentStack.isDirective && stack.jsxRootElement !== stack.parentStack){
            let dName = stack.parentStack.openingElement.name.value().toLowerCase();
            if( dName ==="custom" ){
                return this.createCustomDirective(stack.parentStack,data,callback) || has;
            }
        }

        return has;
    }

    makeDirectiveComponentProperties(stack, data, callback){
        if( stack && stack.parentStack ){
            let parentStack = stack.jsxRootElement === stack ? stack : stack.parentStack;
            let parentIsComponentDirective = this.getComponentDirectiveForDefine( parentStack );
            if(parentIsComponentDirective){
                const desc = parentStack.description();
                this.addDepend( desc );
                let expression = null;
                let modifier = null;
                let [direModule, direName, annotation] = parentIsComponentDirective;
                let directive = this.createIdentifierNode( this.getModuleReferenceName(direModule) );
                direName = this.createLiteralNode( direName );          
                parentStack.attributes.forEach( item=>{
                    if(item.isAttributeXmlns || item.isAttributeDirective)return;
                    let name = item.name.value();
                    let lower = name.toLowerCase();
                    if(lower === 'value'){
                        expression = item.value ? this.createToken(item.value) : this.createLiteralNode(false);
                        return;
                    }
                    if(lower === 'modifier'){
                        modifier = item.value ? this.createToken(item.value) : this.createObjectNode();
                        return;
                    }
                    const node = this.createToken(item);
                    const property = this.createPropertyNode(node.name,node.value, item);
                    if( item.isMemberProperty ){
                        property.isInheritDirectiveProp = true
                        data.props.push( property );
                    }else{
                        property.isInheritDirectiveAttr = true
                        data.attrs.push( property );
                    }
                    if(callback){
                        callback(property);
                    }
                });

                const properties = [
                    this.createPropertyNode(
                        this.createPropertyKeyNode('name'),
                        direName
                    ),
                    this.createPropertyNode(
                        this.createPropertyKeyNode('directiveClass'),
                        directive
                    ),
                    this.createPropertyNode(
                        this.createPropertyKeyNode('value'),
                        expression || this.createLiteralNode(false)
                    )
                ];

                if( modifier ){
                    properties.push(
                        this.createPropertyNode(
                            this.createPropertyKeyNode('modifiers'),
                            modifier
                        )
                    );
                }

                const Component = this.builder.getModuleById('web.components.Component');
                this.addDepend(Component);
                const node = this.createCalleeNode(
                    this.createMemberNode([
                        this.createIdentifierNode( this.getModuleReferenceName(Component) ),
                        this.createIdentifierNode('resolveDirective')
                    ]),
                    [
                        this.createObjectNode(properties),
                        this.createThisNode()
                    ]
                );
                node.isInheritComponentDirective = true;
                data.directives.push(node);
                if(stack.jsxRootElement !== parentStack){
                    this.makeDirectiveComponentProperties(parentStack, data, callback);
                }
                return true
            }
        }
        return false;
    }

    makeSpreadAttributes( spreadAttributes , data){
        if( spreadAttributes && spreadAttributes.length > 0 ){
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
    }

    create(stack){
        const isRoot = stack.jsxRootElement === stack;
        const data = this.getElementConfig();

        let hasText = false;
        let hasJSXText = false;
        let children = stack.children.filter(child=>{
            if(child.isJSXText){
                if(!hasJSXText)hasJSXText = true;
                if(!hasText){
                    hasText = child.value().trim().length > 0;
                }
            }
            return !((child.isJSXScript && child.isScriptProgram) || child.isJSXStyle)
        })

        if(hasJSXText && !hasText){
            children = stack.children.filter(child=>!child.isJSXText)
        }

        let componentDirective = this.getComponentDirectiveForDefine( stack );
        let childNodes =this.makeChildren(children, data);
        let nodeElement = null;
        if( stack.isDirective && stack.openingElement.name.value().toLowerCase() ==="custom" ){
            componentDirective = true;
        }

        if( componentDirective ){
            if( childNodes.type ==='ArrayExpression' && childNodes.elements.length === 1){
                nodeElement = childNodes.elements[0];
            }else{
                nodeElement = childNodes;
            }
        }else{
            if( stack.parentStack.isSlot ){
                const name = stack.parentStack.openingElement.name.value();
                data.slot = this.createLiteralNode(name);
            }else if(stack.parentStack && stack.parentStack.isDirective ){
                let dName = stack.parentStack.openingElement.name.value().toLowerCase();
                if( dName === 'show' ){
                    const condition= stack.parentStack.openingElement.attributes[0];
                    data.directives.push(
                        this.createObjectNode([
                            this.createPropertyNode(this.createIdentifierNode('name'), this.createLiteralNode('show') ),
                            this.createPropertyNode(this.createIdentifierNode('value'), this.createToken( condition.parserAttributeValueStack() ) ),
                        ])
                    );
                }else if( dName ==="custom" ){
                    this.createCustomDirective(stack.parentStack, data);
                }
            }

            const scopedSlot = stack.hasAttributeSlot && stack.openingElement.attributes.find( attr=>!!(attr.isAttributeSlot && attr.value) );
            // const spreadAttributes = [];
            this.makeDirectiveComponentProperties(stack, data);
            this.makeAttributes(stack, childNodes, data, /*spreadAttributes*/);
            this.makeProperties(children, data);
            //this.makeSpreadAttributes(spreadAttributes,data);
            if(stack.isSlot){
                nodeElement = this.makeSlotElement(stack, childNodes);
            }else if(stack.isDirective){
                nodeElement = this.makeDirectiveElement(stack, childNodes);
            }else{
                if( scopedSlot ){
                    nodeElement = this.makeSlotElement(stack, this.makeHTMLElement(stack, data,  childNodes ), scopedSlot);
                }else{
                    nodeElement = this.makeHTMLElement(stack, data,  childNodes );
                }
            }
        }

        if(isRoot){
            if(stack.compilation.JSX && stack.parentStack.isProgram){
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
                const renderMethod = this.createRenderNode(stack, nodeElement || this.createLiteralNode(null) );
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