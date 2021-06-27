const Syntax = require("../core/Syntax");
class SpreadElement extends Syntax{
    emiter(syntax){
        return this.stack.argument.emiter(syntax);
    }
}

module.exports = SpreadElement;