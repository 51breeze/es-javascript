const events = require('events');
const TOP_SCOPE = ["ClassDeclaration","EnumDeclaration","DeclaratorDeclaration","Program"];
const FUNCTION_SCOPE = ["MethodDefinition","MethodGetterDefinition","MethodSetterDefinition","FunctionExpression"];
const SCOPE_MAP = new Map();
class Token extends events.EventEmitter {

    static createRootNode(stack, builder){
        const obj = new Token();
        obj.stack = stack;
        obj.scope = stack.scope;
        obj.compilation = stack.compilation;
        obj.compiler = stack.compiler;
        obj.module =  stack.module;
        obj.plugin = builder.plugin;
        obj.name = builder.name;
        obj.platform = builder.platform;
        obj.parent = null;
        obj.builder = builder;
        return obj.createToken( stack );
    }

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
        const creator = this.plugin.getStack( type );
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

    createThisNode(stack){
        const node = this.createNode('ThisExpression');
        node.stack = stack;
        return node;
    }

    createImportNode(source, specifiers, stack){
        const obj = this.createNode('ImportDeclaration');
        obj.stack = stack;
        obj.source = source instanceof Token ? source : obj.createLiteralNode( source );
        obj.specifiers = [];
        specifiers.forEach( item=>{
            if( Array.isArray(item) ){
                obj.specifiers.push( obj.createImportSpecifierNode( ...item ) );
            }else if( item instanceof Token ){
                item.parent = obj;
                obj.specifiers.push( item );
            }
        });
        return obj;
    }

    createImportSpecifierNode(local, imported=null, hasAs=false){
        if( imported ){
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

    addDepend( dep ){
        this.builder.addDepend(dep, this.module);
    }

    getDependencies(module){
        return this.builder.getDependencies(module || this.module);
    }

    isActiveForModule(module, ctxModule){
        return this.builder.isActiveForModule(module, ctxModule || this.module);
    }

    getParentByType( type ){
        var parent = this.parent;
        var invoke = typeof type === 'function' ? type : item=>item.type === type;
        while( parent && !invoke(parent) ){
            parent = parent.parent;
        }
        return parent;
    }

    checkRefsName(name,top=true,scopeContext=null){

        const context = this.getParentByType(parent=>{
            if( top ){
                return TOP_SCOPE.includes( parent.type );
            }else{
                return FUNCTION_SCOPE.includes( parent.type );
            }
        });

        if( !context )return name;
        var scope = scopeContext;
        if( !scopeContext ){
            scope = this.scope || context.scope;
        }

        var dataset = SCOPE_MAP.get(scope);
        if( !dataset ){
            SCOPE_MAP.set(scope, dataset={
                scope,
                cached:new Set(),
                result:new Map(),
                check( name ){
                    return this.scope.isDefine(name) || this.cached.has(name);
                }
            });
        }else if( dataset.result.has(name) ){
            return dataset.result.get(name);
        }

        if( dataset.check(name) ){
            var index = 1;
            while( dataset.check( name+index ) && index++ );
            var value = name+index;
            dataset.cached.add( name );
            dataset.result.set(name,value);
            const block = top ? context : context.body;
            (block.beforeBody || block.body).splice(0,0,block.createDeclarationNode('const', [
                block.createDeclaratorNode(
                    block.createIdentifierNode(value),
                    block.createIdentifierNode(name),
                )
            ]));
            return value;
        }
        return name;
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
}

module.exports = Token;