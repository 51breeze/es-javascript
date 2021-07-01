const Syntax = require("../core/Syntax");
class ForStatement extends Syntax{
    emiter(syntax){
        
        const condition = this.stack.condition.emiter(syntax);
        const update = this.stack.update.emiter(syntax);
        const indent = this.getIndent();
        if( this.stack.hasAwait ){
            const stack = this.stack.getParentStack(stack=>!!stack.isFunctionExpression);
            const topIndent = this.getIndent( this.scope.asyncParentScopeOf.level+3);
            const initName = this.stack.init.declarations.map( item=>item.id.value() );
            stack.dispatcher("insertBefore", `${topIndent}var ${initName.join(",")};`);

            const expression = this.stack.init.declarations.map( item=>`\t${topIndent}${item.id.value()}=${item.init.emiter(syntax)};`);
            const startLabelIndex = ++stack.awaitCount;
            const body = this.stack.body.emiter(syntax);
            const updateLabelIndex = ++stack.awaitCount;
            const nextLabelIndex = ++stack.awaitCount;

            expression.push( `\t${topIndent}${stack.generatorVarName("_a",true)}.label=${startLabelIndex};`);
            expression.push( `${topIndent}case ${startLabelIndex}:` );
            expression.push(`\t${topIndent}if( !(${condition}) )return [3, ${nextLabelIndex}];`);
            expression.push( body );
            expression.push( `\t${topIndent}${stack.generatorVarName("_a",true)}.label=${updateLabelIndex};`);
            expression.push( `${topIndent}case ${updateLabelIndex}:` );
            expression.push( `\t${topIndent}${update};` );
            expression.push( `\t${topIndent}return [3, ${startLabelIndex}];`);
            expression.push( `${topIndent}case ${nextLabelIndex}:`);
            return expression.join("\r\n");
        }
        const init = this.stack.init.emiter(syntax);
        const body = this.stack.body ? this.stack.body.emiter(syntax) : null;
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