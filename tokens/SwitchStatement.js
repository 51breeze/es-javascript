const Token = require("../core/Token");
class SwitchStatement extends Token{

    constructor(stack){
        super(stack);
        this.condition =this.createToken(stack.condition);
        this.cases = stack.cases.map( item=>this.createToken(item) );
    }

    emitter() {
        const insert = [];
        this.stack.removeAllListeners("insert")
        this.stack.addListener("insert",(content)=>{
            if( content ){
                insert.push(content);
            }
        });
        const condition = this.make(this.stack.condition);
        const indent = this.getIndent();
        if( this.stack.hasAwait ){
            const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
            if(stack){
                const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3 );
                const cases = this.stack.cases.map( item=>this.make(item) ).join("\r\n");
                const labelIndex = ++(this.createDataByStack(stack).awaitCount);
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
        }
        const cases = this.stack.cases.map( item=>this.make(item) ).join("\r\n");
        return `${indent}switch(${condition}){\r\n${cases}\r\n${indent}}`;
    }
}

module.exports = SwitchStatement;