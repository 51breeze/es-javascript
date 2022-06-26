const MethodDefinition = require("./MethodDefinition");
const Constant = require("../core/Constant");
class MethodGetterDefinition extends MethodDefinition{
    createChildren(stack){
        super.createChildren(stack);
        this.isAccessor = true;
        this.isMethodGetterDefinition = true;
        this.kind= Constant.DECLARE_PROPERTY_ACCESSOR;
    }
}
module.exports = MethodGetterDefinition;