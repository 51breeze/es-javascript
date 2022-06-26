const MethodDefinition = require("./MethodDefinition");
class MethodSetterDefinition extends MethodDefinition{
    constructor(stack){
        super(stack);
        this.isMethodSetterDefinition= true;
        this.isAccessor = true;
    }
}
module.exports = MethodSetterDefinition;