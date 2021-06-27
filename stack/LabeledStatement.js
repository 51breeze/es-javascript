const Syntax = require("../core/Syntax");
class LabeledStatement extends Syntax{
    emiter(syntax){
        const label = this.stack.label.value();
        const body  = this.stack.body.emiter(syntax);
        const indent = this.getIndent();
        if( this.stack.body.hasAwait ){
            return body;
        }
        return `${indent}${label}:${body.replace(/^\t/g,'')}`;
    }
}

module.exports = LabeledStatement;