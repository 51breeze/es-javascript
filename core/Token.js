const events = require('events');
const path = require('path');
const TOP_SCOPE = ["ClassDeclaration","EnumDeclaration","DeclaratorDeclaration","Program"];
const FUNCTION_SCOPE = ["MethodDefinition","MethodGetterDefinition","MethodSetterDefinition","FunctionExpression",'FunctionDeclaration'];
class Token extends events.EventEmitter {

    static SCOPE_REFS_All = 31;
    static SCOPE_REFS_TOP = 16;
    static SCOPE_REFS_UP_CLASS = 8;
    static SCOPE_REFS_UP_FUN = 4;
    static SCOPE_REFS_UP = 2;
    static SCOPE_REFS_DOWN = 1;

    constructor(type){
        super();
        this.type = type;
        this.stack = null;
        this.scope = null;
        this.compilation = null;
        this.compiler = null;
        this.module = null;
        this.plugin = null;
        this.name = null;
        this.platform = null;
        this.parent = null;
        this.builder = null;
        this.value = '';
        this.raw = '';
    }

    createNode(stack,type){
        if( !stack )return null;
        const nonStack = typeof stack === 'string';
        if( !type ){
            type = nonStack ? stack : stack.toString();
        }
        const obj = new Token( type );
        obj.stack = nonStack ? null : stack;
        obj.scope = nonStack ? this.scope : stack.scope;
        obj.compilation =  nonStack ? this.compilation : stack.compilation;
        obj.compiler =  nonStack ? this.compiler : stack.compiler;
        obj.module =  nonStack ? this.module : stack.module;
        obj.plugin = this.plugin;
        obj.name = this.name;
        obj.platform = this.platform;
        obj.parent = this;
        obj.builder = this.builder;
        return obj;
    }

    createToken(stack){
        if( !stack )return null;
        const type = stack.toString();
        if( type ==='TypeStatement')return null;
        const creator = this.plugin.getTokenNode( type );
        if( creator ){
            try{
                return creator(this, stack, type);
            }catch(e){
                console.log(e)
            }
        }else{
            throw new Error(`Token class '${stack.toString()}' is not exists.`);
        }
    }

    createFunctionNode( createChildFun, params){
        const node = this.createNode('FunctionExpression');
        const block = node.createNode('BlockStatement');
        block.body = [];
        node.params = [];
        if(params){
            params.forEach( item=>{
                item.parent = node;
                node.params.push( item );
            });
        }
        node.body = block;
        createChildFun( block );
        return node;
    }

    createArrowFunctionNode(params, body){
        const node = this.createNode('ArrowFunctionExpression');
        node.params = params || [];
        node.params.forEach( param=>{
            param.parent = node;
        });
        if( body ){
            node.body = body;
            node.body.parent = node;
        }
        return node;
    }

    createReturnNode( argument ){
        const node = this.createNode('ReturnStatement');
        node.argument = argument;
        argument.parent = node;
        return node;
    }

    createMethodNode(key, createChildFun, params){
        const node = this.createFunctionNode(createChildFun, params);
        node.type = "MethodDefinition";
        if( key ){
            node.key = key instanceof Token ? key : node.createIdentifierNode(key);
            node.key.parent = node;
        }
        return node;
    }

    createObjectNode(properties ,stack){
        const object = this.createNode('ObjectExpression');
        object.stack = stack;
        object.properties = [];
        if( properties ){
            properties.forEach( (value)=>{
                value.parent = object;
                object.properties.push( value );
            });
        }
        return object;
    }

    createArrayNode( elements, stack){
        const object = this.createNode('ArrayExpression');
        object.stack = stack;
        object.elements = [];
        if(elements){
            elements.forEach( (value)=>{
                value.parent = object;
                object.elements.push( value );
            });
        }
        return object;
    }

    createPropertyNode(key, init, stack){
        const propery = this.createNode('Property');
        propery.stack = stack;
        if( key instanceof Token ){
            key.parent = propery;
            propery.key = key;
            propery.computed = key.computed;
        }else{
            propery.key = propery.createIdentifierNode( String(key) );
        }

        if( init instanceof Token ){
            init.parent = propery;
            propery.init = init;
        }else{
            propery.init = propery.createLiteralNode( String(init) );
        }
        return propery;
    }

    createMemberNode(items,stack){
    
        const create = (items, object, ctx)=>{
            const member = ctx.createNode('MemberExpression'); 
            if( object instanceof Token ){
                member.object = object;
            }else{
                member.object = member.createNode('Identifier'); 
                member.object.value = object; 
            }

            const property = items.shift();
            if( property instanceof Token ){
                member.property = property;
            }else{
                member.property = member.createNode('Identifier'); 
                member.property.value = property;
            }

            member.object.parent = ctx;
            member.property.parent = ctx;
            if( items.length > 0 ){
                return create(items, member, member);
            }
            return member;
        }

        items = items.slice(0);
        const node = create(items, items.shift(), this);
        node.stack = stack;
        return node;
    }

    createCalleeNode(callee, args, stack){
        const expression = this.createNode('CallExpression');
        expression.stack = stack;
        callee.parent = expression;
        expression.callee = callee;
        expression.arguments = args || [];
        expression.arguments.forEach( item=>{
            item.parent = expression;
        });
        return expression;
    }

    createAssignmentNode(left,right,stack){
        const expression = this.createNode('AssignmentExpression');
        expression.stack = stack;
        left.parent = expression;
        right.parent = expression;
        expression.left = left;
        expression.right = right;
        return expression;
    }

    createStatementNode( expression, stack){
        const obj = this.createNode('ExpressionStatement');
        obj.stack = stack;
        expression.parent = obj;
        obj.expression=expression;
        return obj;
    }

    createSequenceNode(items, stack){
        const obj = this.createNode('SequenceExpression');
        obj.stack = stack;
        obj.expressions = items;
        items.forEach( item=>{
            item.parent = obj;
        });
        return obj;
    }

    createParenthesNode(expression, stack){
        const obj = this.createNode('ParenthesizedExpression');
        expression.parent = obj;
        obj.stack = stack;
        obj.expression = expression;
        return obj;
    }

    createDeclarationNode( kind, items, stack){
        const obj = this.createNode('VariableDeclaration');
        obj.stack = stack;
        obj.kind = kind;
        obj.declarations = items;
        items.forEach( item=>{
            item.parent = obj;
        });
        return obj;
    }

    createDeclaratorNode(id, init, stack){
        const obj = this.createNode('VariableDeclarator');
        obj.stack = stack;
        obj.id = id instanceof Token ? id : obj.createIdentifierNode(id);
        obj.init = init;
        obj.id.parent = obj;
        if( init ){
            obj.init.parent = obj;
        }
        return obj;
    }

    createLiteralNode(value, raw, stack){
        const node = this.createNode('Literal');
        node.stack = stack;
        node.value = value;
        if( raw === void 0){
            if( typeof value === 'string'){
                node.raw = `"${value}"`;
            }else{
                node.raw = String(value); 
            }
        }else{
            node.raw = String(value);
        }
        return node;
    }

    createIdentifierNode(value, stack){
        const token = this.createNode('Identifier');
        token.stack = stack;
        token.value = value;
        token.raw   = value;
        return token;
    }

    createChunkNode(value, newLine=true, semicolon=false){
        const node = this.createNode('ChunkExpression');
        node.newLine = newLine;
        node.semicolon = semicolon;
        node.value = value;
        node.raw = value;
        return node;
    }

    createThisNode(stack, ctx){
        const node = (ctx||this).createNode('ThisExpression');
        node.stack = stack;
        return node;
    }

    createImportDeclaration(source, specifiers, stack){
        const type = this.builder.plugin.options.module;
        const babel = this.builder.plugin.options.babel;
        if( !babel && type ==='cjs'){
            let onlyDefaultExported = true;
            if(stack && (stack.isImportDeclaration || stack.isExportNamedDeclaration || stack.isExportAllDeclaration) ){
                const compilation = stack.getResolveCompilation();
                if( compilation && compilation.stack ){
                    onlyDefaultExported = !(compilation.stack.exports[0].isExportDefaultDeclaration || compilation.stack.exports.length > 1);
                }
            }
            source = source instanceof Token ? source : this.createLiteralNode( source );
            const node = this.createCalleeNode(this.createIdentifierNode('require'), [source]);
            specifiers = specifiers.map( item=>{
                if( Array.isArray(item) ){
                    return node.createImportSpecifierNode( ...item );
                }else if( item instanceof Token ){
                    item.parent = node;
                    return item;
                }
            }).filter( item=>!!item );
            if( specifiers.length === 1 ){
                if( !onlyDefaultExported && specifiers[0].type === 'ImportDefaultSpecifier' ){
                    return this.createDeclarationNode('const', [
                        this.createDeclaratorNode( 
                            specifiers[0].local, 
                            this.createMemberNode([
                                node,
                                this.createIdentifierNode('default')
                            ])
                        )
                    ]);
                }
                return this.createDeclarationNode('const', [
                    this.createDeclaratorNode( specifiers[0].local, node)
                ]);
            }else if( specifiers.length > 1 ){
                const nonSpecifierItems = specifiers.filter( item=>item.type !=='ImportSpecifier');
                const specifierItems = specifiers.filter( item=>item.type ==='ImportSpecifier');
                const ctx = this.getTopBlockContext();
                const hasDiff = specifierItems.some( item=>item.local.value !== item.imported.value );
                const refs = nonSpecifierItems.length > 0 || hasDiff ? ctx.checkRefsName( path.parse(source.value).name, true, Token.SCOPE_REFS_All, ctx, false) : null;
                const appendBody = ctx.beforeBody || ctx.body;
                if( refs ){
                    const nonSpecifierNodes = nonSpecifierItems.map( item=>{
                        if( item.type==='ImportDefaultSpecifier' && !onlyDefaultExported ){
                            return this.createDeclarationNode('const', [
                                this.createDeclaratorNode(
                                    item.local,
                                    this.createMemberNode([
                                        this.createIdentifierNode(refs),
                                        this.createIdentifierNode('default')
                                    ])
                                )
                            ]);
                        }
                        return this.createDeclarationNode('const', [
                            this.createDeclaratorNode(item.local, this.createIdentifierNode(refs))
                        ]);
                    });
                    appendBody.push( ...nonSpecifierNodes );
                    if( hasDiff ){
                        const specifierNodes = specifierItems.map( item=>{
                            return this.createDeclarationNode('const',[
                                this.createDeclaratorNode(
                                    item.local , 
                                    this.createMemberNode([
                                        this.createIdentifierNode(refs),
                                        item.imported
                                    ])
                                )
                            ]);
                        });
                        appendBody.push( ...specifierNodes );
                    }else{
                        const ObjectPattern = this.createNode('ObjectPattern');
                        ObjectPattern.properties = specifierItems.map( item=>{
                            return ObjectPattern.createPropertyNode(item.local, item.local, item.stack)
                        });
                        if( nonSpecifierItems.length > 0 ){
                            appendBody.push( 
                                this.createDeclarationNode('const', [
                                    this.createDeclaratorNode(ObjectPattern, this.createIdentifierNode(refs))
                                ])
                            );
                        }else{
                            return this.createDeclarationNode('const', [
                                this.createDeclaratorNode(ObjectPattern, node)
                            ]);
                        } 
                    }
                }
                return this.createDeclarationNode('const', [
                    this.createDeclaratorNode(refs, node)
                ]);
            }
            return this.createStatementNode( node );
        }else{
            return this.createImportNode( source, specifiers);
        }
    }

    createImportNode(source, specifiers, stack){
        const obj = this.createNode('ImportDeclaration');
        obj.stack = stack;
        obj.source = source instanceof Token ? source : obj.createLiteralNode( source );
        obj.specifiers = [];
        specifiers.forEach( item=>{
            if( Array.isArray(item) ){
                const node = obj.createImportSpecifierNode( ...item );
                if(node){
                    obj.specifiers.push( node );
                }
            }else if( item instanceof Token ){
                item.parent = obj;
                obj.specifiers.push( item );
            }
        });
        return obj;
    }

    createImportSpecifierNode(local, imported=null, hasAs=false){
        if(!local)return null;
        if( imported && !hasAs ){
           const obj = this.createNode('ImportSpecifier');
           obj.imported =  obj.createIdentifierNode( imported );
           obj.local =  obj.createIdentifierNode( local );
           return obj;
        }else if( hasAs ){
            const obj = this.createNode('ImportNamespaceSpecifier');
            obj.local =  obj.createIdentifierNode( local );
            return obj;
        }else{
            const obj = this.createNode('ImportDefaultSpecifier');
            obj.local =  obj.createIdentifierNode( local );
            return obj;
        }
    }

    createJSXAttrHookInvokeNode(stack, ctx, desc){
        if( !(stack && stack.isMemberProperty && stack.value && desc) )return null;
        const hookAnnot = this.builder.getClassMemberHook( desc );
        if( hookAnnot ){
            let [type,] = hookAnnot;
            if( type && String(type).toLowerCase()==='compiling:create-route-path'){
                if( stack.value && stack.value.isJSXExpressionContainer ){
                    const value = stack.value.description();
                    if(value && value.isModule && stack.isModuleForWebComponent(value)){
                        let route = this.builder.getModuleRoutes(value);
                        if(route){
                            if( Array.isArray(route) )route = route[0];
                            if(route.path){
                                return ctx.createLiteralNode(this.builder.createRoutePath(route))
                            }else{
                                console.error(`[es-javascript] Route missing the 'path' property.`)
                            }
                        }
                        return ctx.createLiteralNode( value.getName('/') );
                    }
                }
                return null;
            }
            if(type){
                const systemModule = this.builder.getGlobalModuleById('System');
                ctx.addDepend( systemModule );
                return ctx.createCalleeNode(
                    ctx.createMemberNode([
                        this.builder.createThisNode(stack, ctx),
                        ctx.createIdentifierNode('invokeHook')
                    ]),
                    [
                        ctx.createLiteralNode(type),
                        ctx.createToken(stack.value),
                        ctx.createLiteralNode( stack.name.value() ),
                        ctx.createLiteralNode( desc.module.getName() )
                    ]
                );
            }
        }
        return null;
    }

    insertNodeBlockContextAt(node){
        const block = this.getParentByType( (parent)=>{
            return parent.type ==='BlockStatement' || parent.type ==="FunctionExpression" || TOP_SCOPE.includes(parent.type)
        },true);
        if( block ){
            if( node.type !== "ExpressionStatement"){
                node = this.createStatementNode( node );
            }
            node.parent = block;
            block.body.push( node );
        }
    }

    insertNodeBlockContextTop(node){
        const top = this.getTopBlockContext();
        if( top ){
            top.insertNodeBlockContextAt( node );
        }
    }

    getTopBlockContext(){
        return this.getParentByType( (parent)=>{
            return TOP_SCOPE.includes(parent.type)
        },true);
    }

    addDepend( dep ){
        this.builder.addDepend(dep, this.module || this.compilation);
    }

    getDependencies(module){
        return this.builder.getDependencies(module || this.module);
    }

    isActiveForModule(module, ctxModule){
        return this.builder.isActiveForModule(module, ctxModule || this.module || this.compilation);
    }

    getParentByType( type , flag=false){
        var parent = flag ? this : this.parent;
        var invoke = typeof type === 'function' ? type : item=>item.type === type;
        while( parent && !invoke(parent) ){
            parent = parent.parent;
        }
        return parent;
    }

    checkRefsName(name,top=true,flags=Token.SCOPE_REFS_DOWN | Token.SCOPE_REFS_UP_FUN, context=null, initInvoke=null, whenNotExistsRecord=false, genUniVarsFlag=false){
        const ctx = context || this.getParentByType(parent=>{
            if( top ){
                return TOP_SCOPE.includes( parent.type );
            }else{
                return FUNCTION_SCOPE.includes( parent.type );
            }
        }, true);

        if( !ctx ){
            return name;
        }
        const scope = (context && context.scope) || this.scope;
        const fnScope = top ?  scope.getScopeByType('top') : scope.getScopeByType('function');
        const key = fnScope ? fnScope : scope;
        const cache = this.builder.scopeVarCache;

        if(top===true)flags=Token.SCOPE_REFS_All;

        var dataset = cache.get( key );
        if( !dataset ){
            cache.set(key, dataset={
                scope:key,
                context:ctx,
                result:new Map(),
                check(name, scope){
                    if( this.result.has(name) )return true;
                    if( flags === Token.SCOPE_REFS_All ){
                        return scope.topDeclarations.has(name);
                    }
                    if( scope.isDefine(name) ){
                        return true;
                    }
                    var index = 0;
                    var flag = 0;
                    while( flag < (flags & Token.SCOPE_REFS_All) ){
                        flag = Math.pow(2,index++);
                        switch( flags & flag ){
                            case Token.SCOPE_REFS_DOWN :
                                if(scope.declarations.has(name) || scope.hasChildDeclared(name))return true;
                            case Token.SCOPE_REFS_UP :
                                if( scope.isDefine(name) )return true;
                            case Token.SCOPE_REFS_TOP :
                                if( scope.isDefine(name) || scope.hasChildDeclared(name) )return true;
                            case Token.SCOPE_REFS_UP_FUN :
                                if( scope.isDefine(name,'function') )return true;
                            case Token.SCOPE_REFS_UP_CLASS :
                                if( scope.isDefine(name,'class') )return true;
                        }
                    }
                    return false;
                }
            });
        }else if( dataset.result.has(name) && dataset.scope === key && !genUniVarsFlag ){
            return dataset.result.get(name);
        }

        var body = ctx.beforeBody || ctx.body || (ctx.body=[]);
        var block = ctx;
        if( body.type === "BlockStatement" ){
            block = body;
            body = body.body;
        }

        if( dataset.check(name,scope) ){
            var index = 1;
            while( dataset.check(name+index, scope) && index++ );
            var value = name+index;
            dataset.result.set(name,value);
            dataset.result.set(value,value);
            const event = {name,value,top,context:ctx,scope,prevent:false};
            ctx.emit('onCreateRefsName', event);
            if( !event.prevent ){
                let init = null;
                if( initInvoke ){
                    init = initInvoke(value,name);
                }
                if( !init && top && initInvoke !== false ){
                    init = block.createIdentifierNode(name);
                }
                if( init ){
                    body.push(block.createDeclarationNode('const', [
                        block.createDeclaratorNode(
                            block.createIdentifierNode(value),
                            init,
                        )
                    ]));
                }
            }
            return value;
        }else if( whenNotExistsRecord ){
            dataset.result.set(name,name);
        }
        
        return name;
    }

    genUniVarRefs(name, context=null, desc=null, top=false, flags=Token.SCOPE_REFS_DOWN){
        var cache = null
        if(desc){
            cache = this.builder.generatedVarRefs.get( desc );
            if(!cache) this.builder.generatedVarRefs.set(desc, cache={});
            if( Object.prototype.hasOwnProperty.call(cache,name) ){
                return cache[name];
            }
        }
        const value = this.checkRefsName(name, top, flags, context, null, true, true);
        if( cache ){
            cache[name] = value;
        }
        return value;
    }

    getDeclareRefsName(desc, name, flags=Token.SCOPE_REFS_DOWN | Token.SCOPE_REFS_UP_FUN, initInvoke=null){
        if( !desc )return name;
        var cache = this.builder.generatedVarRefs.get( desc );
        if(!cache) this.builder.generatedVarRefs.set(desc, cache={});
        if( Object.prototype.hasOwnProperty.call(cache,name) ){
            return cache[name];
        }
        return cache[name] = this.checkRefsName(name, false, flags, null, initInvoke);
    }

    getModuleReferenceName(module,context){
        context = context || this.module;
        return this.builder.getModuleReferenceName(module,context);
    }

    error(message , stack=null){
        if( stack===null ){
            stack = this.stack;
        }
        const range = this.compilation.getRangeByNode(stack.node);
        const file  = this.compilation.file;
        message+= ` (${file}:${range.start.line}:${range.start.column})`;
        this.compiler.callUtils("error",message);
    }

    warn(message , stack=null){
        if( stack===null ){
            stack = this.stack;
        }
        const range = this.compilation.getRangeByNode(stack.node);
        const file  = this.compilation.file;
        message+= ` (${file}:${range.start.line}:${range.start.column})`;
        this.compiler.callUtils("warn",message);
    }

    isRawJsx(){
        return this.builder.isRawJsx();
    }
}

module.exports = Token;