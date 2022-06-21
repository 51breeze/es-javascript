const Syntax = require("../core/Syntax");
class ForOfStatement extends Syntax{
    emitter_none(){
        const left = this.make(this.stack.left);
        const right = this.make(this.stack.right);
        const body = this.stack.body && this.make(this.stack.body);
        const indent = this.getIndent();
        const condition = `${left} of ${right}`;
        if( !body ){
            return this.semicolon(`for(${condition})`);
        }
        if( body ){
            return `${indent}for(${condition}){\r\n${body}\r\n${indent}}`;
        }
        return `${indent}for(${condition}){\r\n${indent}}`;
    }
    emitter(){
        const left = this.make(this.stack.left);
        const name = this.stack.left.value();
        const right = this.make(this.stack.right);
        const body = this.stack.body && this.make(this.stack.body);
        const indent = this.getIndent();
        const refs = this.generatorVarName(this.stack,"_i");
        const vRefs = this.generatorVarName(this.stack,"_v");
        this.addDepend( this.getGlobalModuleById('System') );
        const condition = `${left},${vRefs},${refs}=${this.checkRefsName('System')}.getIterator(${right}); ${refs} && (${vRefs}=${refs}.next()) && !${vRefs}.done;`;
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