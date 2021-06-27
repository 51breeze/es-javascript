const Syntax = require("../core/Syntax");
class PropertyDefinition extends Syntax{
    emiter(syntax) {
        return this.stack.init ? this.stack.init.emiter(syntax) : `null`;
    }
}

module.exports = PropertyDefinition;