const Syntax = require("../core/Syntax");
class ForStatement extends Syntax{
    emitter(){
        const condition = this.make(this.stack.condition);
        const update = this.make(this.stack.update);
        const indent = this.getIndent();
        if( this.stack.hasAwait ){
            const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
            const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3);
            const initName = this.stack.init.declarations.map( item=>item.id.value() );
            stack.dispatcher("insertBefore", `${topIndent}var ${initName.join(",")};`);

            const expression = this.stack.init.declarations.map( item=>`\t${topIndent}${item.id.value()}=${this.make(item.init)};`);
            const startLabelIndex = ++(this.createDataByStack(stack).awaitCount);
            const body = this.make(this.stack.body);
            const updateLabelIndex = ++(this.createDataByStack(stack).awaitCount);
            const nextLabelIndex = ++(this.createDataByStack(stack).awaitCount);

            expression.push( `\t${topIndent}${this.generatorVarName(stack,"_a",true)}.label=${startLabelIndex};`);
            expression.push( `${topIndent}case ${startLabelIndex}:` );
            expression.push(`\t${topIndent}if( !(${condition}) )return [3, ${nextLabelIndex}];`);
            expression.push( body );
            expression.push( `\t${topIndent}${this.generatorVarName(stack,"_a",true)}.label=${updateLabelIndex};`);
            expression.push( `${topIndent}case ${updateLabelIndex}:` );
            expression.push( `\t${topIndent}${update};` );
            expression.push( `\t${topIndent}return [3, ${startLabelIndex}];`);
            expression.push( `${topIndent}case ${nextLabelIndex}:`);
            return expression.join("\r\n");
        }
        const init = this.make(this.stack.init);
        const body = this.stack.body && this.make(this.stack.body);
        if( !this.stack.body ){
            return this.semicolon(`${indent}for(${init};${condition};${update})`);
        }
        if( body ){
            return `${indent}for(${init};${condition};${update}){\r\n${body}\r\n${indent}}`;
        }
        return `${indent}for(${init};${condition};${update}){\r\n${indent}}`;
    }
}

module.exports = ForStatement;