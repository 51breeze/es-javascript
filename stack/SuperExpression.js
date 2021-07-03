const Syntax = require("../core/Syntax");
class SuperExpression  extends Syntax {
    emitter(){
        const parent = this.module.extends[0];
        const fnScope = this.scope.getScopeByType("function");
        if( fnScope.isConstructor && !this.parentStack.isMemberExpression ){
           return `${parent.id}`;
        }
        return `${parent.id}`;
    }
}

module.exports = SuperExpression;