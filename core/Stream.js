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
        this.line++;
        this.code('\r\n');
        this.column = 0;
    }

    push( str ){
        if( str ){
            this.code += str;
        }
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
            this.push( '\t'.repeat( this.indent ) );
        }
        this.push(value);
        this.column += value.length;
    }

    withEnd( expr ){
        if( expr ){
            this.withString( expr );
            this.withSemicolon();
        }
        this.newLine();
    }

    withSemicolon(){
        const code = this.code;
        const char = code.charCodeAt( code.length-1 );
        if( char === 59 || char === 10 || char ===13 || char ===32 || char===125 ){
            return this;
        }
        this.push(';');
        return this;
    }

    emitSequence( items ){
        if( !items )return this;
        const len = items.length-1;
        items.forEach( (item,index)=>{
            item.emit( this );
            if( index < len ){
                this.withToken(',');
            }
        });
        return this;
    }

    emitEnd( node ){
        if( node ){
            node.emit( this );
            this.withSemicolon();
        }
        this.newLine();
        return this;
    }

    emitToken( node ){
        if( node ){
            node.emit( this );
        }
        return this;
    }

    toString(){
        return this.code;
    }
}

module.exports = Generator;