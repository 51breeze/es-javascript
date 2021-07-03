const Syntax = require("../core/Syntax");
class IfStatement extends Syntax{
    emiter(syntax){
        const condition = this.stack.condition.emiter(syntax);
        const consequent = this.stack.consequent.emiter(syntax);
        const indent = this.getIndent();
        if(this.stack.hasAwait){
            const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
            const labelIndex= ++(this.createDataByStack(stack).awaitCount);
            const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
            const alternate = this.stack.alternate && this.stack.alternate.emiter(syntax);
            const expression = [
                `${topIndent}\tif(!(${condition}))return [3,${labelIndex}];`,
                consequent,
            ];
            const isReturnNode=(target)=>{
                const body = target && target.body;
                const last = body && body[ body.length-1 ];
                return !!(last && last.isReturnStatement);
            }
            const aRet = isReturnNode(this.stack.consequent);
            if( !alternate ){
                if( !aRet ){
                    expression.push(`${topIndent}\t${this.generatorVarName(stack,"_a",true)}.label=${labelIndex};`);
                }
                expression.push(`${topIndent}case ${labelIndex}:`);
                return expression.join("\r\n");
            }else{
                if( !aRet ){
                    const nextLabel = ++(this.createDataByStack(stack).awaitCount);
                    expression.push(`${topIndent}\treturn [3,${nextLabel}];`);
                }
                expression.push(`${topIndent}case ${labelIndex}:`);
                expression.push(alternate);
                if( !isReturnNode(this.stack.alternate) ){
                    expression.push(`${topIndent}\t${this.generatorVarName(stack,"_a",true)}.label=${nextLabel};`);
                }
                if( !aRet ){
                    expression.push(`${topIndent}case ${nextLabel}:`);
                }
                return  expression.join("\r\n");
            }
        }
        const alternate = this.stack.alternate && this.stack.alternate.emiter(syntax);
        if( this.stack.alternate ){
            return `${indent}if(${condition}){\r\n${consequent}\r\n${indent}}else{\r\n${alternate}\r\n${indent}}`;
        }
        return `${indent}if(${condition}){\r\n${consequent}\r\n${indent}}`;
    }
}

module.exports = IfStatement;