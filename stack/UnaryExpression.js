const Syntax = require("../core/Syntax");
class UnaryExpression extends Syntax {
   emiter(syntax){
       const argument = this.stack.argument.emiter(syntax);
       const operator = this.stack.node.operator;
       const prefix   = this.stack.node.prefix;
       if( prefix ){
         if( operator==="typeof"){
            return `${operator} ${argument}`;
         }
         return `${operator}${argument}`;
       }
       return `${argument}${operator}`;
   }
}

module.exports = UnaryExpression;