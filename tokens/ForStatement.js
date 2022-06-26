const Token = require("../core/Token");
class ForStatement extends Token{
    constructor(){
        super(stack);
        this.condition = this.createToken(stack.condition);
        this.update = this.createToken(stack.update);
        this.init = this.createToken(stack.init);
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

module.exports = ForStatement;