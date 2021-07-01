const Syntax = require("../core/Syntax");
class SequenceExpression extends Syntax{
    emiter(syntax){
         const expressions = this.stack.expressions.map( item=>item.emiter(syntax) );
         if( expressions.length > 1 ){
             return '('+expressions.join(",")+')';
         }
         return '('+expressions.join(",")+')';
    }
}

module.exports = SequenceExpression;