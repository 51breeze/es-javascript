const Syntax = require("../core/Syntax");
class ThisExpression  extends Syntax {
    emitter(){
        let scope = this.scope.getScopeByType("function");
        if( scope && scope.isArrow ){
            let stack = this.stack.getParentStack( stack=>!!(stack.isFunctionExpression && !stack.isArrowFunctionExpression), true);
            if( stack.isProgram && stack.isJSXProgram && stack.body.length == 1){
                stack = stack.body[0]
            }
            stack.dispatcher("insertThisName", this.generatorVarName(stack,"_this",true) );
            return this.generatorVarName(stack,"_this");
        }
        return `this`;
    }
}

module.exports = ThisExpression;