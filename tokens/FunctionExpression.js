const Token = require("../core/Token");
class FunctionExpression extends Token{

    createChildren(stack){
        this.params = this.createToken(stack.params);
        this.body  = this.createToken(stack.body);
        this.async = stack.async ? this.createNode(stack.node.async) : null;
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

    make(gen){
       
        if( this.async ){
            this.async.make( gen );
            gen.withSpace();
        }

        gen.withString('function');
        if( this.key ){
            gen.withSpace();
            this.key.make( gen );
        }

        gen.withParenthesL();
        gen.withSequence( this.params );
        gen.withParenthesL();
        this.body.make( gen );
       
    };

}

module.exports = FunctionExpression;