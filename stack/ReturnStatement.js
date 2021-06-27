const Syntax = require("../core/Syntax");
class ReturnStatement extends Syntax{
    emiter(syntax){
        const argument = this.stack.argument ? this.stack.argument.emiter(syntax) : null;
        if( this.stack.fnScope.async ){
            return this.semicolon(`return [2, ${argument}]`);
        }
        return this.semicolon(`return ${argument}`);
    }
}

module.exports = ReturnStatement;