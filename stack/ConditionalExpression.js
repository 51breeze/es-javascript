const Syntax = require("../core/Syntax");
class ConditionalExpression extends Syntax{
     emitter(){
          const test = this.make(this.stack.test);
          const consequent = this.make(this.stack.consequent);
          
          
          if(this.stack.hasAwait){
               const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
               if( stack ){
                    let labelIndex= ++(this.createDataByStack(stack).awaitCount);
                    const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
                    const blockStack = this.stack.getParentStack((parent)=>{
                         return !!(parent.isBlockStatement || parent.isSwitchStatement || parent.isFunctionExpression)
                    });
                    const expression = [
                         `${topIndent}\tif(!(${test}))return [3,${labelIndex}];`,
                         consequent
                    ];

                    const isReturnNode=(target)=>{
                         return !!(target.isReturnStatement);
                    }
                    //const aRet = isReturnNode(this.stack.consequent);
                    //expression.push(`${topIndent}\t${this.generatorVarName(stack,"_a",true)}.sent();`);
                    expression.push(`${topIndent}\treturn [3,${labelIndex+1}];`);
                   
                    expression.push(`${topIndent}case ${labelIndex}:`);

                    const alternate = this.make(this.stack.alternate);
                    expression.push(alternate);

                    let nextIndex =  ++(this.createDataByStack(stack).awaitCount);
                    expression.push(`${topIndent}\t${this.generatorVarName(stack,"_a",true)}.label=${nextIndex};`);

                    expression.push(`${topIndent}case ${nextIndex}:`);

                    blockStack.dispatcher("insert", expression.join("\r\n") );

                    var refs = this.generatorVarName(this.stack,"_res",true);

                    stack.dispatcher("insertBefore", this.semicolon(`var ${refs}`) );

                    return `${refs}`
               }
          }

          const alternate = this.make(this.stack.alternate);

          return `${test} ? ${consequent} : ${alternate}`;
     }
}
module.exports = ConditionalExpression;