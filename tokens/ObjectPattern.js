const Token = require("../core/Token");
class ObjectPattern extends Token{
    constructor(stack){
        super(stack);
        this.properties = this.createToken(stack.properties);
    }
    
    emitter(){
        return this.stack.properties.map( item=> {
            return this.make(item);
        });
    }
}

module.exports = ObjectPattern;