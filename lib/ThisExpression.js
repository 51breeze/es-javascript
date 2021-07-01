const Syntax = require("../core/Syntax");
class ThisExpression  extends Syntax {
    emiter(syntax){
        let scope = this.scope.getScopeByType("function");
        if( scope.isArrow ){
            const stack = this.stack.getParentStack( stack=>!!(stack.isFunctionExpression && !stack.isArrowFunctionExpression) );
            stack.dispatcher("insertThisName", stack.generatorVarName("_this",true) );
            return stack.generatorVarName("_this");
        }
        return `this`;
    }
}

module.exports = ThisExpression;