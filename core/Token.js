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
        this.value = null;
    }

    getValue(){
        return this.value;
    }

    createChildren(stack){}

    createToken(stack, flag=false){
        if( !stack )return null;
        const plugin = this.plugin;
        const type = flag ? stack : stack.toString();
        const tokenClass = plugin.getToken( type );
        if( tokenClass ){
            const obj = new tokenClass( type );
            obj.stack = flag ? null : stack;
            obj.scope = flag ? this.scope : stack.scope;
            obj.compilation = flag ? this.compilation : stack.compilation;
            obj.compiler = flag ? this.compiler : stack.compiler;
            obj.module = flag ? this.module : stack.module;
            obj.plugin = plugin;
            obj.name = this.name;
            obj.platform = this.platform;
            obj.parent = this;
            obj.builder = this.builder;
            if( !flag ){
                obj.createChildren( stack );
            }
            return obj;
        }else{
            throw new Error(`Token class '${stack.toString()}' is not exists.`);
        }
    }

    createFunctionToken( createChildFun ){
        const expression = method.createToken('FunctionExpression', true);;
        const block = expression.createToken('BlockStatement');
        expression.params = [];
        expression.body = block;
        createChildFun( block );
        return expression;
    }

    createMethodToken(key, createChildFun){
        const method = this.createToken('MethodDefinition',true);
        method.expression = method.createFunctionToken( createChildFun );
        method.key = method.createToken('Identifier', true);
        method.key.value = key;
        return method;
    }

    createObjectToken( properties ){
        const object = this.createToken('ObjectExpression',true);
        object.properties = [];
        properties.forEach( (value,key)=>{
            if( value instanceof Token ){
                value.parent = object;
                object.properties.push( value );
            }else{
                object.properties.push( object.createPropertyToken(key,value) );
            }
        });
        return object;
    }

    createArrayToken( elements ){
        const object = this.createToken('ArrayExpression',true);
        object.elements = [];
        elements.forEach( (value)=>{
            if( value instanceof Token ){
                value.parent = object;
                object.elements.push( value );
            }else{
                object.properties.push( object.createIdentifierToken(value) );
            }
        });
        return object;
    }

    createPropertyToken(key, init){
        var propery = key;
        if( typeof propery === 'string' ){
            this.createToken('Property', true);
            propery.key = propery.createToken('Identifier', true);
            propery.key.value = key;
        }
        if( typeof init === 'string'){
            propery.init = propery.createToken( value , true);
            propery.init.value = init;
        }else if( init instanceof Token ){
            init.parent = propery;
            propery.init = init;
        }else if( init.isStack ){
            propery.init = propery.createToken( init ); 
        }
        return propery;
    }

    createMemberToken(items){
        const create = (items, object)=>{
            const member = (object || this).createToken('MemberExpression',true); 
            if( typeof items[ items.length-1] === 'string' ){
                member.property = member.createToken('Identifier',true); 
                member.property.value = items.pop();
            }else{
                member.property = items.pop();
            }

            if( object ){
                member.object = object;
            }else{
                if( typeof items[ items.length-1 ] === 'string' ){
                    member.object = member.createToken('Identifier',true); 
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

    createCalleeToken(callee, args){
        const expression = this.createToken('CallExpression',true);
        callee.parent = expression;
        expression.callee = callee;
        expression.arguments = args;
        args.forEach( item=>{
            item.parent = expression;
        });
        return expression;
    }

    createAssignmentToken(left,right){
        const expression = this.createToken('AssignmentExpression',true);
        left.parent = expression;
        right.parent = expression;
        expression.left = left;
        expression.right = right;
        return expression;
    }

    createStatementToken( expression ){
        const obj = this.createToken('ExpressionStatement',true);
        expression.parent = obj;
        obj.expression=expression;
        return obj;
    }

    createDeclarationToken( kind, items){
        const obj = this.createToken('VariableDeclaration',true);
        obj.kind = kind;
        obj.declarations = items;
        items.forEach( item=>{
            item.parent = obj;
        });
        return obj;
    }

    createDeclaratorToken( id, init){
        const obj = this.createToken('VariableDeclarator',true);
        obj.id = typeof id === 'string' ? obj.createIdentifierToken(id) : id;
        obj.init = typeof init === 'string' ? obj.createIdentifierToken( init ) : init;
        obj.id.parent = obj;
        obj.init.parent = obj;
        return obj;
    }

    createLiteralToken(value){
        if( value instanceof Token)return value;
        const token = this.createToken('Literal',true);
        token.value = value;
        return token;
    }

    createIdentifierToken(value, type='Identifier'){
        if( value instanceof Token)return value;
        const token = this.createToken(type,true);
        token.value = value;
        return token;
    }

    createImportToken(source, specifiers){
        const obj = this.createToken('ImportDeclaration',true);
        obj.source =  obj.createIdentifierToken( source );
        obj.specifiers = [];
        specifiers.forEach( item=>{
            if( Array.isArray(item) ){
                obj.specifiers.push( obj.createImportSpecifierToken( ...item ) );
            }else if( item instanceof Token ){
                item.parent = obj;
                obj.specifiers.push( item );
            }
        });
    }

    createImportSpecifierToken(local, imported=null, hasAs=false){
        if( imported ){
           const obj = this.createToken('ImportSpecifier',true);
           obj.imported =  obj.createIdentifierToken( imported );
           obj.local =  obj.createIdentifierToken( local );
           return obj;
        }else if( hasAs ){
            const obj = this.createToken('ImportNamespaceSpecifier',true);
            obj.local =  obj.createIdentifierToken( local );
            return obj;
        }else{
            const obj = this.createToken('ImportDefaultSpecifier',true);
            obj.local =  obj.createIdentifierToken( local );
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