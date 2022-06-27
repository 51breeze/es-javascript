const Token = require("../core/Token");
class ForStatement extends Token{

    createChilren(stack){
        this.condition = this.createToken(stack.condition);
        this.update = this.createToken(stack.update);
        this.init = this.createToken(stack.init);
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
        this.init && this.init.make( gen );
        gen.withSemicolon();
        this.condition && this.condition.make( gen );
        gen.withSemicolon();
        this.update && this.update.make( gen );
        gen.withParenthesR();
        if( this.body.stack.isBlockStatement ){
           this.body.make( gen );
        }else{
           if( this.body )this.body.make( gen );
           this.withSemicolon();
        }
    }
}

module.exports = ForStatement;