const Syntax = require("../core/Syntax");
class FunctionDeclaration extends Syntax{
    emiter(syntax){
        const indent = this.getIndent();
        return indent+this.stack.emiter( syntax );
    }
}

module.exports = FunctionDeclaration;