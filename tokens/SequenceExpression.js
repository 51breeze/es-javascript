const Token = require("../core/Token");
class SequenceExpression extends Token{

    constructor(stack){
        super(stack);
        this.expressions = stack.expressions.map( item=>this.createToken(item) );
    }

    emitter(){
         const expressions = this.make(this.stack.expressions.map( item=>item) );
         if( expressions.length > 1 ){
             return '('+expressions.join(",")+')';
         }
         return '('+expressions.join(",")+')';
    }
}

module.exports = SequenceExpression;