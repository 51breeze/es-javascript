const Syntax = require("../core/Syntax");
class SwitchCase  extends Syntax {
   emiter(syntax){
      const condition = this.stack.condition && this.stack.condition.emiter(syntax);
      if( this.stack.condition ){
         const refs = this.parentStack.condition.description(this);
         if( refs.isLiteral && refs.value() != condition ){
            this.stack.condition.warn(`'${refs.value()}' scalar value will not match the conditional statement`)
         }
      }

      const indent = this.getIndent();
      if( this.stack.parentStack.hasAwait ){
         
         const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
         const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3);
         const labelIndex = ++stack.awaitCount;
         this.parentStack.dispatcher("insert", `${topIndent}case ${labelIndex}:`);
         const isReturnNode=(body)=>{
            const last = body && body[ body.length-1 ];
            return !!(last && last.isReturnStatement);
         }
         const consequent = this.stack.consequent.map( item=>item.emiter(syntax) ).join("\r\n");
         if( consequent ){
            this.parentStack.dispatcher("insert", consequent );
         }

         if( !this.stack.hasBreak && !isReturnNode(this.stack.consequent) ){
            this.parentStack.dispatcher("insert", `${topIndent}\treturn [3,${stack.awaitCount+1}];` );
         }
        
         if(condition){
            return `${indent}\tcase ${condition} : return [3,${labelIndex}];`;
         }
         return `${indent}\tdefault: return [3,${labelIndex}];`;
      }
      const consequent = this.stack.consequent.map( item=>item.emiter(syntax) ).join("\r\n");
      if( condition ){
         return `${indent}case ${condition} :\r\n${consequent}`;
      }
      if( consequent ){
         return `${indent}default:\r\n${consequent}`;
      }
      return `${indent}default:`;
   }
}

module.exports = SwitchCase;