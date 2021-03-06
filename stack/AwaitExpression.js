const Syntax = require("../core/Syntax");
class AwaitExpression extends Syntax{
     emitter(){
          const stack = this.stack.getParentStack( stack=>!!stack.isFunctionExpression);
          const indent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
          const parentStack = this.stack.parentStack.isExpressionStatement ? this.stack.parentStack.parentStack : this.stack.parentStack;
          if( parentStack.isBlockStatement || parentStack.isSwitchCase || parentStack.isConditionalExpression ){
               const expression = [
                    `${indent}\treturn [4,${this.make(this.stack.argument)}];`,
                    `${indent}case ${++(this.createDataByStack(stack).awaitCount)}:`,
               ];
               if( parentStack.isConditionalExpression ){
                    const refs = this.generatorRefName(stack,"_cdv",'conditionalDefaultValue',null,true,'insertBefore');
                    expression.push( `${indent}\t${refs}=${this.generatorVarName(stack,"_a",true)}.sent();` ) 
               }else{
                    expression.push( `${indent}\t${this.generatorVarName(stack,"_a",true)}.sent();`);
               }
               return expression.join("\r\n");
          }else if(stack){
               const blockStack = this.stack.getParentStack((parent)=>{
                    return !!(parent.isBlockStatement || parent.isSwitchStatement)
               });
               if( blockStack ){
                    blockStack.dispatcher("insert", `${indent}\treturn [4,${this.make(this.stack.argument)}];` );
                    blockStack.dispatcher("insert", `${indent}case ${++(this.createDataByStack(stack).awaitCount)}:` );
               }
               return `${this.generatorVarName(stack,"_a",true)}.sent()`;
          } 
     }
}

module.exports = AwaitExpression;