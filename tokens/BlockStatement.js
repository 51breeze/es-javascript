const Token = require("../core/Token");
class BlockStatement extends Token{
    constructor(type){
        super(type);
        this.body = [];
    }

    createChildren(stack){
        stack.body.forEach( item=> this.body.push( this.createToken(item) ) );
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

    make(gen){
        this.body.forEach( child=>{
            gen.make( child );
        });
    }
}

module.exports = BlockStatement;