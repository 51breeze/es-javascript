const Token = require("../core/Token");
class PackageDeclaration extends Token{

    constructor(stack){
        super(stack);
        this.body = [];
        this.stack.imports.forEach( item=> this.addChildToken( this.createToken(item) ) )
        this.stack.body.forEach( item=> this.addChildToken( this.createToken(item) ) );
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
}

module.exports = PackageDeclaration;