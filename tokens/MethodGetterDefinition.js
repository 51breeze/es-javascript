const MethodDefinition = require("./MethodDefinition");
class MethodGetterDefinition extends MethodDefinition{
    constructor(stack){
        super(stack);
        this.isMethodGetterDefinition= true;
        this.isAccessor = true;
        this.kind= stack.kind;
    }
}
module.exports = MethodGetterDefinition;