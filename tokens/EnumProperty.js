const Syntax = require("../core/Syntax");
class EnumProperty extends Syntax{
    emitter(){
        return this.stack.init.value();
    }
}
module.exports = EnumProperty;