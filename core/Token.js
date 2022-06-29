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
        const type = stack.toString();
        if( type ==='TypeStatement')return null;

        const creator = this.plugin.getStack( type );
        if( creator ){
            return creator(this, stack, type);
        }else{
            throw new Error(`Token class '${stack.toString()}' is not exists.`);
        }
    }

    createFunctionNode( createChildFun, stack){
        const node = this.createNode('FunctionExpression');
        node.stack = stack;
        const block = node.createNode('BlockStatement');
        block.body = [];
        node.params = [];
        node.body = block;
        createChildFun( block );
        return node;
    }

    createMethodNode(key, createChildFun, stack){
        const node = this.createFunctionNode(createChildFun, stack);
        node.type = "MethodDefinition";
        node.key = key instanceof Token ? key : node.createIdentifierNode(key);
        node.key.parent = node;
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
        elements.forEach( (value)=>{
            value.parent = object;
            object.elements.push( value );
        });
        return object;
    }

    createPropertyNode(key, init, stack){
        const propery = this.createNode('Property');
        propery.stack = stack;
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

    createMemberNode(items,stack){
        const create = (items, object)=>{
            const member = (object || this).createNode('MemberExpression'); 
            if( typeof items[ items.length-1] === 'string' ){
                member.property = member.createNode('Identifier'); 
                member.property.value = items.pop();
            }else{
                member.property = items.pop();
            }
            if( object ){
                member.object = object;
            }else{
                if( typeof items[ items.length-1 ] === 'string' ){
                    member.object = member.createNode('Identifier'); 
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
        const node = create( items.slice(0) );
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
        obj.init.parent = obj;
        return obj;
    }

    createLiteralNode(value, raw, stack){
        const node = this.createNode('Literal');
        node.stack = stack;
        node.value = value;
        node.raw = raw || `"${value}"`;
        return node;
    }

    createIdentifierNode(value, stack){
        const token = this.createNode('Identifier');
        token.stack = stack;
        token.value = value;
        token.raw   = value;
        return token;
    }

    createChunkNode(value,stack){
        const node = this.createNode('ChunkExpression');
        node.stack = stack;
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
        return this.builder.checkRefsName(name, this);
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