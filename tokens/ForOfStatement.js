const Token = require("../core/Token");
class ForOfStatement extends Token{

    createChilren(stack){
        this.left = this.createToken(stack.left);
        this.right = this.createToken(stack.right);
        this.body = this.createToken(stack.body);
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

    make( gen ){
        gen.newLine();
        gen.withString('for');
        gen.withParenthesL();
        this.left.make( gen );
        gen.withOperator('of');
        this.right.make( gen );
        gen.withParenthesR();
        if( this.body.stack.isBlockStatement ){
           this.body.make( gen );
        }else{
           if( this.body )this.body.make( gen );
           this.withSemicolon();
        }
    }

    
}

module.exports = ForOfStatement;