const Syntax = require("../core/Syntax");
class MethodDefinition extends Syntax{
    emiter(syntax){
        return this.expression.emiter(syntax);
    }
}

module.exports = MethodDefinition;