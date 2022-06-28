const events = require('events');
class Token extends events.EventEmitter {

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
        const plugin = this.plugin;
        const type = stack.toString();
        const creator = plugin.getToken( type );
        if( creator ){
            return creator(this, stack, type);
        }else{
            throw new Error(`Token class '${stack.toString()}' is not exists.`);
        }
    }

    createFunctionNode( createChildFun, stack){
        const expression = method.createNode(stack, 'FunctionExpression');;
        const block = expression.createNode('BlockStatement');
        block.body = [];
        expression.params = [];
        expression.body = block;
        createChildFun( block );
        return expression;
    }

    createMethodNode(key, createChildFun,stack){
        const method = this.createToken(stack, 'MethodDefinition');
        method.expression = method.createFunctionNode( createChildFun, stack);
        method.key = method.createIdentifierNode(key);
        return method;
    }

    createObjectNode( properties ,stack){
        const object = this.createNode(stack,'ObjectExpression');
        object.properties = [];
        properties.forEach( (value)=>{
            value.parent = object;
            object.properties.push( value );
        });
        return object;
    }

    createArrayNode( elements, stack){
        const object = this.createNode(stack,'ArrayExpression');
        object.elements = [];
        elements.forEach( (value)=>{
            value.parent = object;
            object.elements.push( value );
        });
        return object;
    }

    createPropertyNode(key, init, stack){
        const propery = this.createNode(stack,'Property');
        if( key instanceof Token ){
            key.parent = propery;
            propery.key = key;
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

    createMembertNode(items,stack){
        const create = (items, object)=>{
            const member = (object || this).createtNode(stack,'MemberExpression'); 
            if( typeof items[ items.length-1] === 'string' ){
                member.property = member.createtNode('Identifier'); 
                member.property.value = items.pop();
            }else{
                member.property = items.pop();
            }
            if( object ){
                member.object = object;
            }else{
                if( typeof items[ items.length-1 ] === 'string' ){
                    member.object = member.createtNode('Identifier'); 
                    member.object.value = items.pop();
                }else{
                    member.object = items.pop();
                }
            }
            member.property.parent = member;
            member.object.parent = member;
            if( items.length > 0 ){
                return create(items, member);
            }
            return member;
        }
        return create( items.slice(0) );
    }

    createCalleetNode(callee, args, stack){
        const expression = this.createNode(stack,'CallExpression');
        callee.parent = expression;
        expression.callee = callee;
        expression.arguments = args;
        args.forEach( item=>{
            item.parent = expression;
        });
        return expression;
    }

    createAssignmentNode(left,right,stack){
        const expression = this.createNode(stack,'AssignmentExpression');
        left.parent = expression;
        right.parent = expression;
        expression.left = left;
        expression.right = right;
        return expression;
    }

    createStatementToken( expression, stack){
        const obj = this.createNode(stack,'ExpressionStatement');
        expression.parent = obj;
        obj.expression=expression;
        return obj;
    }

    createDeclarationNode( kind, items, stack){
        const obj = this.createNode(stack,'VariableDeclaration');
        obj.kind = kind;
        obj.declarations = items;
        items.forEach( item=>{
            item.parent = obj;
        });
        return obj;
    }

    createDeclaratorNode(id, init, stack){
        const obj = this.createNode(stack,'VariableDeclarator');
        obj.id = id instanceof Token ? id : obj.createIdentifierNode(id);
        obj.init = init;
        obj.id.parent = obj;
        obj.init.parent = obj;
        return obj;
    }

    createLiteralNode(value, raw, stack){
        const node = this.createNode(stack, 'Literal');
        node.value = value;
        node.raw = raw || `"${value}"`;
        return node;
    }

    createIdentifierNode(value, stack){
        const token = this.createNode(stack, 'Identifier');
        token.value = value;
        token.raw   = value;
        return token;
    }

    createChunkNode(value,stack){
        const node = this.createNode(stack,'ChunkExpression');
        node.value = value;
        node.raw = value;
        return node;
    }

    createThisNode(stack){
        return this.createNode(stack,'ThisExpression');
    }

    createImportNode(source, specifiers, stack){
        const obj = this.createNode(stack,'ImportDeclaration');
        obj.source =  obj.createIdentifierNode( source );
        obj.specifiers = [];
        specifiers.forEach( item=>{
            if( Array.isArray(item) ){
                obj.specifiers.push( obj.createImportSpecifierNode( ...item ) );
            }else if( item instanceof Token ){
                item.parent = obj;
                obj.specifiers.push( item );
            }
        });
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
        return this.builder.isDependModule(module, ctxModule || this.module);
    }

    checkRefsName( name ){
        this.builder.checkRefsName(name, this);
    }

    getModuleReferenceName(module,context){
        context = context || this.module;
        return this.builder.getModuleReferenceName(module,context);
    }

    getDescription(){
        if( this.stack ){
            return this.stack.description();
        }
        return null;
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