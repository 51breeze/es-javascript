const Syntax = require("../core/Syntax");
class SequenceExpression extends Syntax{
    emitter(){
         const expressions = this.make(this.stack.expressions.map( item=>item) );
         if( expressions.length > 1 ){
             return '('+expressions.join(",")+')';
         }
         return '('+expressions.join(",")+')';
    }
}

module.exports = SequenceExpression;