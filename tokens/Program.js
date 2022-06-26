const Token = require("../core/Token");
class Program extends Token{

    constructor(stack){
        super(stack);
        this.body =[];
        this.externals = [];
        stack.body.forEach( item=> this.addChildToken( this.createToken(item) ) );
        stack.externals.forEach( item=> this.externals.push( this.createToken(item) ) );
    }

    addChildToken(token){
        const children = this.body;
        children.push( token );
        token.parent = this;
        return this;
    }
 
    addChildTokenAt(token, index){
        const children = this.body;
        if( index < 0 ){
            index = children.length + index;
        }else if( index > children.length ){
            index = children.length;
        }
        children.splice(index,0,token);
        token.parent = this;
        return this;
    }

    buildExternal(){
        const stack = this.stack;
        if( stack && stack.externals.length > 0 ){
            const externals = stack.externals.map( item=>this.make(item) ).filter(item=>!!item);
            if( externals.length > 0 ){
                const refs = [];
                this.addDepend( this.getGlobalModuleById('Class') );
                this.createDependencies(null,refs)
                return refs.concat([ 
                    this.semicolon('/*externals code*/'),
                    this.semicolon(`(function(){\r\n\t${externals.join("\r\n\t")}\r\n}())`)
                ]).join("\r\n");
            }
        }
        return null;
    }
    buildJsx(){
        const root = this.stack.body[0];
        return this.make(root, 0);
    }
    emitter(){
        if( this.compilation.JSX ){
            return this.buildJsx();
        }else{
            return this.buildExternal();
        }
    }
}

module.exports = Program;