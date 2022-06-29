class Generator{
    constructor(module,compilation){
        this.module = module;
        this.compilation = compilation;
        this.code = '';
        this.line = 0;
        this.column = 0;
        this.indent = 0;
        this.file = compilation.file;
    }

    newBlock(){
       this.indent++;
       this.newLine();
       return this;
    }

    endBlock(){
        this.indent--;
        return this;
    }

    newLine(){
        const char = this.code.charCodeAt( this.code.length-1 );
        if( char === 10 || char ===13 ){
            return this;
        }
        this.line++;
        this.code+='\r\n';
        this.column = 0;
        return this;
    }

    getStartColumn(){
        if( this.column===0 ){
            return this.indent * 2;
        }
        return this.column;
    }

    withString( value ){
        if( !value )return;
        if( this.column===0 ){
            this.column = this.indent * 2;
            this.code += '\t'.repeat( this.indent );
        }
        this.code +=value;
        this.column += value.length;
    }

    withEnd( expr ){
        if( expr ){
            this.withString( expr );
            this.withSemicolon();
        }
        this.newLine();
    }

    withParenthesL(){
        this.withString('(');
    }

    withParenthesR(){
        this.withString(')');
    }

    withBracketL(){
        this.withString('[');
    }

    withBracketR(){
        this.withString(']');
    }

    withBraceL(){
        this.withString('{');
    }

    withBraceR(){
        this.withString('}');
    }

    withSpace(){
        this.withString(' ');
    }

    withDot(){
        this.withString('.');
    }

    withColon(){
        this.withString(':');
    }

    withKeyValue(name, value, compute=false){
        if( typeof name === 'string' ){
            if(compute){
                this.withString(`[${name}]`);
            }else{
                this.withString(`"${name}"`);
            }
        }else{
            if(compute){
                name.make( this );
            }else{
                if( name.type ==="Identifier"){
                    this.withString(`"`);
                    name.make( this );
                    this.withString(`"`);
                }else{
                    name.make( this );
                }
            }
        }
        this.withColon();
        if( Array.isArray(value) ){
            this.withBraceL();
            const len = value.length-1;
            value.forEach( (item,index)=>{
                this.withKeyValue(item.name,item.value, item.name.compute );
                if(index < len ){
                    this.withComma();
                }
            });
            this.withBraceR();
        }else{
            if( typeof value === 'string' ){
                this.withString(value);
            }else if(value){
                value.emit(this);
            }else{
                this.withString(`null`);
            }
        }
    }

    withObject( properties ){
        this.withBraceL();
        const len = properties.length-1;
        properties.forEach( (item,index)=>{
            this.withKeyValue(item.name,item.value,item.name.compute);
            if(index < len ){
                this.withComma();
            }
        });
        this.withBraceR();
    }

    withCall(callee, args){
        callee.make( this );
        this.withParenthesL();
        this.withSequence( args );
        this.withParenthesR();
    }

    withOperator( value ){
        this.withString(` ${value} `);
    }

    withComma(){
        this.withString(',');
    }

    withSemicolon(){
        const code = this.code;
        const char = code.charCodeAt( code.length-1 );
        if( char === 59 || char === 10 || char ===13 || char ===32 || char===125 ){
            return this;
        }
        this.withString(';');
        return this;
    }

    withSequence( items ){
        if( !items )return this;
        const len = items.length-1;
        items.forEach( (item,index)=>{
            this.make( item );
            if( index < len ){
                this.withString(',');
            }
        });
        return this;
    }

    make( token ){
        if( !token )return;
        switch( token.type ){
            case "ArrayExpression" :
            case "ArrayPattern" :
                this.withBracketL();
                this.withSequence(token.elements);
                this.withBracketR();
            break;
            case "ArrowFunctionExpression" :
                this.withParenthesL();
                this.withSequence(token.params);
                this.withParenthesR();
                this.withString('=>')
                this.make(token.body);
            break;
            case "AssignmentExpression" :
            case "AssignmentPattern" :
                this.make(token.left);
                this.withString('=');
                this.make(token.right);
            break;
            case "AwaitExpression" :
                this.withString('await ');
                this.make(token.argument);
            break;
            case "BinaryExpression" :
                this.make(token.left);
                this.withOperator( token.operator );
                this.make(token.right);
            break;
            case "BreakStatement" :
                this.newLine();
                this.withString('break');
                if(token.label){
                    this.withSpace();
                    this.make(token.label);
                }
                this.withSemicolon();
            break;
            case "BlockStatement" :
                this.withBraceL();
                this.newBlock();
                token.body.forEach( item=>this.make(item) );
                this.endBlock();
                this.withBraceR();
            break;
            case "ChunkExpression" :
                if( token.value ){
                    // this.newLine();
                    // this.withString( token.value );
                }
            break;
            case "CallExpression" :
                this.make(token.callee)
                this.withParenthesL();
                this.withSequence(token.arguments);
                this.withParenthesR();
            break;
            case "ConditionalExpression" :
                this.make(token.test);
                this.withOperator('?');
                this.make(token.consequent);
                this.withOperator(':');
                this.make(token.alternate);
            break;
            case "ContinueStatement" :
                this.newLine();
                this.withString('continue');
                if(token.label){
                    this.withSpace();
                    this.make(token.label);
                }
                this.withSemicolon();
            break;
            case "DoWhileStatement" :
                this.newLine();
                this.withString('do');
                this.make(token.body);
                this.withString('while');
                this.withParenthesL();
                this.make(token.condition);
                this.withParenthesR();
                this.withSemicolon();
            break;
            case "ExpressionStatement" :
                this.newLine();
                this.make(token.expression);
                this.withSemicolon();
            break;
            case "ForInStatement" :
                this.newLine();
                this.withString('for');
                this.withParenthesL();
                this.make(token.left);
                this.withOperator('in');
                this.make(token.right);
                this.make(token.body);
            break;
            case "ForOfStatement" :
                this.newLine();
                this.withString('for');
                this.withParenthesL();
                this.make(token.left);
                this.withOperator('of');
                this.make(token.right);
                this.make(token.body);
            break;
            case "ForStatement" :
                this.newLine();
                this.withString('for');
                this.withParenthesL();
                this.make(token.init);
                this.withSemicolon();
                this.make(token.condition);
                this.withSemicolon();
                this.make(token.update);
                this.make(token.body);
            break;
            case "MethodDefinition" :
            case "MethodGetterDefinition" :
            case "MethodSetterDefinition" :
            case "FunctionDeclaration" :
                this.withString('function');
                this.withSpace();
                this.make( token.key );
                this.withParenthesL();
                this.withSequence(token.params);
                this.withParenthesR();
                this.make(token.body);
            break;
            case "FunctionExpression" :
                this.withString('function');
                this.withParenthesL();
                this.withSequence(token.params);
                this.withParenthesR();
                this.make(token.body);
            break;
            case "Identifier" :
                this.withString( token.value );
            break;
            case "IfStatement" :
                this.newLine();
                this.withString('if');
                this.withParenthesL();
                this.make(token.condition);
                this.withParenthesR();
                this.make(token.consequent);
                if( token.consequent.type !=="BlockStatement" ){
                    this.withSemicolon();
                }
                if( token.alternate ){
                    this.withString('else')
                    this.withSpace()
                    this.make(token.alternate);
                    if( token.alternate.type !=="BlockStatement" ){
                        this.withSemicolon();
                    }
                }
            break;
            case "ImportDeclaration" :
                this.newLine();
                this.withString('import');
                this.withSpace();
                this.make( token.local );
                this.withSpace();
                this.withString('from');
                this.make( token.source );
                this.withSemicolon();
            break;
            case "LabeledStatement" :
                this.newLine();
                this.make( token.label );
                this.withString(':');
                this.make( token.body );
            break;
            case "Literal" :
                this.withString( token.raw );
            break;
            case "LogicalExpression" :
                this.make(token.left);
                this.withOperator( token.operator );
                this.make(token.right);
            break;
            case "MemberExpression" :
                this.make(token.object);
                this.withString('.');
                this.make(token.property);
            break;
            case "NewExpression" :
                this.make(token.callee);
                this.withParenthesL();
                this.withSequence( token.arguments );
                this.withParenthesR();
            break;
            case "ObjectExpression" :
            case "ObjectPattern" :
                this.withBraceL();
                this.withSequence( token.properties );
                this.withBraceR();
            break;
            case "ParenthesizedExpression" :
                this.withParenthesL();
                this.make( token.expression );
                this.withParenthesR();
            break;
            case "Property" :
                this.make( token.key );
                this.withColon()
                this.make( token.init );
            break;
            case "PropertyDefinition" :
                this.make( token.init );
            break;
            case "RestElement" :
                this.withString('...' );
                this.withString( token.value );
            break;
            case "ReturnStatement" :
                this.withString('return');
                this.withSpace();
                this.make( token.argument );
            break;
            case "SequenceExpression" :
                this.withSequence( token.expressions );
            break;
            case "SpreadElement" :
                this.withString('...' );
                this.make( token.argument );
            break;
            case "SwitchCase" :
                this.newLine();
                if( token.condition ){
                    this.withString('case');
                    this.withSpace();
                    this.make( token.condition );
                }else{
                    this.withString('default' );
                }
                this.withSpace();
                this.withColon();
                token.consequent.forEach( item=>this.make(item) );
            break;
            case "SwitchStatement" :
                this.newLine();
                this.withString('switch');
                this.withParenthesL();
                this.make( token.condition );
                this.withParenthesR();
                this.withBraceL();
                this.newBlock();
                token.cases.forEach( item=>this.make(item) );
                this.endBlock();
                this.withBraceR();
            break;
            case "TemplateElement" :
                this.withString('"');
                this.withString( token.value.replace(/\u0022/g,'\\"') );
                this.withString('"');
            break;
            case "TemplateLiteral" :
                const expressions =token.expressions;
                const end = token.quasis.length-1;
                token.quasis.map( (item,index)=>{
                    this.make( item );
                    if(expressions.length > index){
                        this.withString(' + ')
                        this.withParenthesL()
                        this.make( expressions[index] );
                        this.withParenthesR()
                    }
                    if( end < index ){
                        this.withString(' + ');
                    }
                });
            break;
            case "ThisExpression" :
                this.withString('this');
            break;
            case "ThrowStatement" :
                this.newLine();
                this.withString('throw');
                this.withSpace();
                this.make( token.argument );
                this.withSemicolon();
            break;
            case "TryStatement" :
                this.newLine();
                this.withString('try');
                this.make( token.block );
                this.withString('catch');
                this.withParenthesL();
                this.make( token.param );
                this.withParenthesR();
                this.make( token.handler );
                if( token.finally ){
                    this.withString('finally');
                    this.make( token.finalizer );
                }
            break;
            case "UnaryExpression" :
            case "UpdateExpression" :
                if( token.prefix ){
                    this.withString(token.operator);
                    this.withSpace();
                    this.make( token.argument )
                }else{
                    this.make( token.argument )
                    this.withSpace();
                    this.withString(token.operator);
                }
            break;
            case "VariableDeclaration" :
                !token.inFor && this.newLine();
                this.withString(token.kind);
                this.withSpace();
                this.withSequence( token.declarations );
                !token.inFor && this.withSemicolon();
            break;
            case "VariableDeclarator" :
                this.make( token.id );
                if( token.init ){
                    this.withOperator('=');
                    this.make( token.init );
                }
            break;
            case "WhileStatement" :
                this.withString('while');
                this.withParenthesL();
                this.make( token.condition );
                this.withParenthesR();
                this.make( token.body );
                if( token.body.type !=="BlockStatement" ){
                    this.withSemicolon();
                }
            break;
            case "ClassDeclaration" :
            case "InterfaceDeclaration" :
            case "EnumDeclaration" :
            case "DeclaratorDeclaration" :
                token.body.forEach( item=>this.make(item) )
        }
    }

    toString(){
        return this.code;
    }
}

module.exports = Generator;