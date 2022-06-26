const Token = require("../core/Token");
class Declarator  extends Token {
    get value(){
        return this.stack.value();
    }
}

module.exports = Declarator;