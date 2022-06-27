const Token = require("../core/Token");
class EnumProperty extends Token{
    get value(){
        return this.stack.init.value();
    }
    createChildren(stack){
        this.key = this.createToken(stack.key);
        this.init = this.createToken(stack.init);
    }
    make( gen ){
        this.init.make( gen );
    }
}
module.exports = EnumProperty;