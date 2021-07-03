const Syntax = require("../core/Syntax");
class ObjectPattern extends Syntax {
    emitter(){
        return this.stack.properties.map( item=> {
            return this.make(item);
        });
    }
}

module.exports = ObjectPattern;