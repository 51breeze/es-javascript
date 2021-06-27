const Syntax = require("../core/Syntax");
class AwaitExpression extends Syntax{
     emiter(syntax){
          const stack = this.stack.getParentStack( stack=>!!stack.isFunctionExpression );
          const indent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
          const parentStack = this.stack.parentStack.isExpressionStatement ? this.stack.parentStack.parentStack : this.stack.parentStack;
          if( parentStack.isBlockStatement || parentStack.isSwitchCase ){
               const expression = [
                    `${indent}\treturn [4,${this.stack.argument.emiter(syntax)}];`,
                    `${indent}case ${++stack.awaitCount}:`,
                    `${indent}\t${stack.generatorVarName("_a",true)}.sent();`
               ];
               return expression.join("\r\n");
          }else{
               const blockStack = this.stack.getParentStack((parent)=>{
                    return !!(parent.isBlockStatement || parent.isSwitchStatement)
               });
               blockStack.dispatcher("insert", `${indent}\treturn [4,${this.stack.argument.emiter(syntax)}];` );
               blockStack.dispatcher("insert", `${indent}case ${++stack.awaitCount}:` );
               return `${stack.generatorVarName("_a",true)}.sent()`;
          } 
     }
}

module.exports = AwaitExpression;