const Syntax = require("../core/Syntax");
class PropertyDefinition extends Syntax{
    emitter() {
        return this.stack.init ? this.make(this.stack.init) : `null`;
    }
}

module.exports = PropertyDefinition;