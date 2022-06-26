const Syntax = require("../core/Syntax");
class SuperExpression  extends Syntax {
    emitter(){
        const parent = this.module.extends[0];
        const fnScope = this.scope.getScopeByType("function");
        if( fnScope.isConstructor && !this.parentStack.isMemberExpression ){
            return this.getModuleReferenceName(parent);
        }
        return this.getModuleReferenceName(parent);
    }
}

module.exports = SuperExpression;