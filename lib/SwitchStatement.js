const Syntax = require("../core/Syntax");
class SwitchStatement  extends Syntax {
    emiter(syntax) {
        const insert = [];
        this.stack.removeAllListeners("insert")
        this.stack.addListener("insert",(content)=>{
            if( content ){
                insert.push(content);
            }
        });
        const condition = this.stack.condition.emiter(syntax);
        const indent = this.getIndent();
        if( this.stack.hasAwait ){
            const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
            const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
            const cases = this.stack.cases.map( item=>item.emiter(syntax) ).join("\r\n");
            const labelIndex = ++stack.awaitCount;
            const expression = [
                `${indent}switch(${condition}){`,
                cases,
                `${indent}}`,
                `${topIndent}\treturn [3,${labelIndex}];`,
                insert.join("\r\n"),
                `${topIndent}case ${labelIndex}:`
            ];
            return expression.join("\r\n");
        }
        const cases = this.stack.cases.map( item=>item.emiter(syntax) ).join("\r\n");
        return `${indent}switch(${condition}){\r\n${cases}\r\n${indent}}`;
    }
}

module.exports = SwitchStatement;