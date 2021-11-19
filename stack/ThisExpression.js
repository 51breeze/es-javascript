const Syntax = require("../core/Syntax");
class ThisExpression  extends Syntax {
    emitter(){
        let scope = this.scope.getScopeByType("function");
        if( scope && scope.isArrow ){
            const stack = this.stack.getParentStack( stack=>!!(stack.isFunctionExpression && !stack.isArrowFunctionExpression) );
            stack.dispatcher("insertThisName", this.generatorVarName(stack,"_this",true) );
            return this.generatorVarName(stack,"_this");
        }
        return `this`;
    }
}

module.exports = ThisExpression;