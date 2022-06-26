const events = require('events');
class Token extends events.EventEmitter {
    constructor(type){
        this._type = type;
        this._value = null;
        this._parent = null;
        this._module = null;
        this._compilation = null;
        this._compiler = null;
        this._scope = null;
        this._builder = null;
        this._makeCallback = null;
        this._line = 0;
        this._column = 0;
        this._node = null;
        this._context = this;
        this._root = this;
        this._data = null;
    }

    getBuilder(){
        return this._builder;
    }

    getData(){
        return this._data || (this._data = {});
    }

    getType(){
        return this._type;
    }

    getValue(){
        return this._value;
    }

    setValue( value ){
        if( value ){
            this._value = value;
        }
    }

    getModule(){
        return this._module;
    }

    getCompilation(){
        return this._compilation;
    }

    getCompiler(){
        return this._compiler;
    }

    getScope(){
        return this._scope;
    }

    getContext(){
        return this._context;
    }

    getParent(){
        return this._parent;
    }

    getChildren(){
        return this._children || (this._children=[]);
    }

    getLine(){
        return this._line;
    }

    setLine( line ){
        this._line = line;
    }

    getColumn(){
        return this._column;
    }

    setColumn( column ){
        this._column = column;
    }

    addChild(child){
        const children = this.getChildren();
        children.push( child );
        child.parent = this;
        return gen;
    }
 
    addChildAt(child, index){
        const children = this.getChildren();
        if( index < 0 ){
            index = children.length + index;
        }else if( index > children.length ){
            index = children.length;
        }
        children.splice(index,0,child);
        child.parent = this;
        return gen;
    }

    createToken(type,value,originlNode){
        if(!type)return null;
        const token = new Token(type);
        token.setValue( value );
        if( originlNode ){
            token.setLocation( originlNode.loc );
            token._node = originlNode;
        }
        token._module = this._module;
        token._compilation = this._compilation;
        token._compiler = this._compiler;
        token._scope = this._scope;
        token._builder = this._builder;
        token._parent = this;
        token._context = this._context;
        token._root = this._root;
        return token;
    }

    createNode(stack){
        if(!stack)return null;
        const type = stack.toString();
        const builder  = this._builder;
        const creator = builder.getTransformPlugin( type );
        if( creator ){
            const token = new Token( type );
            token._module = stack.module;
            token._compilation = stack.compilation;
            token._compiler = stack.compiler;
            token._scope = stack.scope;
            token._node = stack.node;
            token._builder = builder;
            token._parent = this;
            token._context = this._context;
            token._root = this._root;
            if( this._type ==='BlockStatement' || this._type ==='SwitchStatement' || this._type === 'SwitchCase'){
                token._context = this;
            }
            token.setLocation( stack.node.loc );
            if( creator ){
                creator.call(token, stack);
            }
            return token;
        }else{
            throw new Error(`Generator '${type}' is not exists.`);
        }
    }

    getParentByType( type ){
        var fn = type;
        if( typeof type === 'string' ){
            fn = (token)=>token._type === type;
        }
        var tok = this.parent;
        while( tok ){
            if( fn( tok ) ){
                return tok;
            }
            tok = tok.parent;
        }
        return null;
    }

    checkDeclareExists(name){

        this._scope.isDefine( name )

    }

    setLocation(loc){
        if( loc && loc.start ){
            this._line = loc.start.line;
            this._column = loc.start.column;
        }
    }

    make( callback ){
        this._makeCallback = callback;
    }

    emit( stream ){
        if( this._makeCallback ){
            this._makeCallback.call(this, stream);
        }else{
            const value = this.getValue();
            if( value ){
                if( this._type ==="Identifier" ){
                    const sourceMap = this._builder.sourceMap;
                    if( sourceMap && this.node){
                        sourceMap.addMapping({
                            source: this._compilation.file,
                            original: {line: this.line, column: this.column },
                            generated: {line: stream.line, column: stream.getStartColumn()},
                            name:this.node ? this.node.name : null
                        });
                    }
                }
                stream.withString( value );
            }
        }
        return this;
    }

    toString(){
        return this.getValue();
    }
}

module.exports = Token;