const Syntax = require("../core/Syntax");
class Declarator  extends Syntax {
    emiter(syntax){
        return this.stack.value();
    }
}

module.exports = Declarator;