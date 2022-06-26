const Token = require("../core/Token");
class EnumProperty extends Token{
    get value(){
        return this.stack.init.value();
    }
}
module.exports = EnumProperty;