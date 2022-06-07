const Syntax = require("../core/Syntax");
class TryStatement extends Syntax {
   emitter(){
      
      const indent = this.getIndent();
      if( this.stack.hasAwait ){

         const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
         if( stack ){

            const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
            const handRefs = this.generatorVarName(stack,"_a",true);
            const startLabelIndex= this.createDataByStack(stack).awaitCount;
            const block = this.make(this.stack.block);
            const trys = Array(4);

            trys[0] = startLabelIndex;
            trys[1] = ++this.createDataByStack(stack).awaitCount;

            const name   =  this.make(this.stack.param);
            const handler=  this.make(this.stack.handler);
            const isReturnNode=(target)=>{
               const body = target && target.body;
               const last = body && body[ body.length-1 ];
               return !!(last && (last.isReturnStatement) );
           }

            var hasHandlerExit = isReturnNode(this.stack.handler);
            var finalizer  = this.stack.finalizer;
            var hasFinal = false;
            var hasFinalExit = false;
            if( finalizer && finalizer.body.length > 0 ){
               hasFinal = true;
               trys[2] = ++this.createDataByStack(stack).awaitCount; 
               hasFinalExit = isReturnNode(finalizer);
               finalizer = this.make(finalizer);
            }

            trys[3] = ++this.createDataByStack(stack).awaitCount; 
            
            const expression = [
               `${topIndent}\t${handRefs}.trys.push([${trys.join(',')}]);`,
               block,
               `${topIndent} case ${trys[1]} :`,
               `${topIndent}\t${name} = ${handRefs}.sent();`,
               `${handler}`,
            ];

            if( !hasHandlerExit ){
               expression.push(`${topIndent}\treturn [3 /*break*/, ${trys[3]}];`);
            }

            if( hasFinal ){
               expression.push(`${topIndent}case ${trys[2]}:`);
               expression.push(`${finalizer}`);
               if( !hasFinalExit ){
                  expression.push(`${topIndent}\treturn [7 /*endfinally*/];`);
               }
            }

            expression.push(`${topIndent}case ${trys[3]}:`);
            expression.push(`${topIndent}\treturn [2 /*return*/];`);
            return expression.join('\r\n');
         }
      }

      const block  =  this.make(this.stack.block);
      const name = this.make(this.stack.param);
      const handler=  this.make(this.stack.handler);
      var finalizer  =  this.stack.finalizer && this.make(this.stack.finalizer);

      //trys
      if(finalizer){
         return `${indent}try{\r\n${block}\r\n${indent}}catch(${name}){\r\n${handler}\r\n${indent}}finally{\r\n${finalizer}\r\n${indent}}`;
      }
      return `${indent}try{\r\n${block}\r\n${indent}}catch(${name}){\r\n${handler}\r\n${indent}}`;
   }
}

module.exports = TryStatement;