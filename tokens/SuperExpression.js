const Token = require("../core/Token");
class SuperExpression extends Token{


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