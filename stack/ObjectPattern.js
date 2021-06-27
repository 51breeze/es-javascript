const Syntax = require("../core/Syntax");
class ObjectPattern extends Syntax {
    emiter(syntax){
        return this.stack.properties.map( item=> {
            return item.emiter(syntax);
        });
    }
}

module.exports = ObjectPattern;