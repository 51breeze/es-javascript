const MethodDefinition = require("./MethodDefinition");
const Constant = require("../core/Constant");
class MethodSetterDefinition extends MethodDefinition{
    createChildren(stack){
        super.createChildren(stack);
        this.isAccessor = true;
        this.isMethodSetterDefinition = true;
        this.kind= Constant.DECLARE_PROPERTY_ACCESSOR;
    }
}
module.exports = MethodSetterDefinition;