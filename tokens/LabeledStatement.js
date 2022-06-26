const Token = require("../core/Token");
class LabeledStatement extends Token{

    emitter(){
        const label = this.stack.label.value();
        const body  = this.make(this.stack.body);
        const indent = this.getIndent();
        if( this.stack.body.hasAwait ){
            return body;
        }
        return `${indent}${label}:${body.replace(/^\t/g,'')}`;
    }

    constructor(stack){
        super(stack);
        this.label = this.createToken( stack.label );
        this.body = this.createToken( stack.body );
        this.createChilrenForBlock( this.body );
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

module.exports = LabeledStatement;