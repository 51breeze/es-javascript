const Token = require("../core/Token");
class ForOfStatement extends Token{
    constructor(stack){
        super(stack);
        this.left = this.createToken(stack.left);
        this.right = this.createToken(stack.right);
        this.body = this.createToken(stack.body);
        this.createChilrenForBlock(this.body);
    }

    addChildToken(token){
        const body = this.body;
        if( body && body.stack.isBlockStatement ){
            body.addChildToken( token );
        }
        return this;
    }
 
    addChildTokenAt(token, index){
        const body = this.body;
        if( body && body.stack.isBlockStatement ){
            body.addChildTokenAt( token, index );
        }
        return this;
    }
}

module.exports = ForOfStatement;