const Syntax = require("../core/Syntax");
class ConditionalExpression extends Syntax{
     emitter(){
          const test = this.make(this.stack.test);
          let consequent = this.make(this.stack.consequent);
          let hasBefore = this.stack.consequent.isAwaitExpression;
          let hasAfter = this.stack.alternate.isAwaitExpression;
          if(this.stack.hasAwait && (hasBefore || hasAfter) ){
               const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
               if( stack ){
                    let labelIndex= ++(this.createDataByStack(stack).awaitCount);
                    const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
                    const blockStack = this.stack.getParentStack((parent)=>{
                         return !!(parent.isBlockStatement || parent.isSwitchStatement || parent.isFunctionExpression)
                    });
                    const inParent = (target)=>!!target.parentStack.parentStack.isConditionalExpression;
                    const hasParentConditional = inParent(this.stack.alternate) || inParent(this.stack.consequent);
                    const refs = this.generatorRefName(stack,"_cdv",'conditionalDefaultValue',null,true,'insertBefore');
                    if( !hasBefore  ){
                         consequent = this.semicolon(`${refs} = ${consequent}`);
                    }
                    const expression = [
                         `${topIndent}\tif(!(${test}))return [3,${labelIndex}];`,
                         consequent
                    ];
                    let alternate = this.make(this.stack.alternate);
                    if( !hasAfter ){
                         alternate = `${refs} = ${alternate}`;
                    }
                    let nextIndex =  this.createDataByStack(stack).awaitCount;
                    expression.push(`${topIndent}\treturn [3,${nextIndex+1}];`);
                    expression.push(`${topIndent}case ${labelIndex}:`);
                    expression.push(alternate);
                    nextIndex =  ++(this.createDataByStack(stack).awaitCount);
                    expression.push(`${topIndent}\t${this.generatorVarName(stack,"_a",true)}.label=${nextIndex};`);
                    expression.push(`${topIndent}case ${nextIndex}:`);
                    if( hasParentConditional ){
                         return expression.join("\r\n");
                    }else{
                         blockStack.dispatcher("insert", expression.join("\r\n") );
                         return refs;
                    }
               }
          }
          const alternate = this.make(this.stack.alternate);
          return `${test} ? ${consequent} : ${alternate}`;
     }
}
module.exports = ConditionalExpression;