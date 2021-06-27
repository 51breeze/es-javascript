const Syntax = require("../core/Syntax");
class ForOfStatement extends Syntax{
    emiter(syntax){
        const left = this.stack.left.emiter(syntax);
        const name = this.stack.left.value();
        const right = this.stack.right.emiter(syntax);
        const body = this.stack.body ? this.stack.body.emiter(syntax) : null;
        const indent = this.getIndent();
        const refs = this.scope.generateVarName("_i");
        const vRefs = this.scope.generateVarName("_v");
        const condition = `${left},${vRefs},${refs}=System.getIterator(${right}); ${refs} && (${vRefs}=${refs}.next()) && !${vRefs}.done;`;
        if( !this.stack.body ){
            return this.semicolon(`${indent}for(${condition})`);
        }
        if( body ){
            const assign = this.semicolon(`\t${name}=${vRefs}.value`);
            return `${indent}for(${condition}){\r\n${assign}\r\n${body}\r\n${indent}}`;
        }
        return `${indent}for(${condition}){\r\n${indent}}`;
    }
}

module.exports = ForOfStatement;