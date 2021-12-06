const Syntax = require("../core/Syntax");
class SuperExpression  extends Syntax {
    emitter(){
        const parent = this.module.extends[0];
        const fnScope = this.scope.getScopeByType("function");
        if( fnScope.isConstructor && !this.parentStack.isMemberExpression ){
            if( this.getConfig('webComponent') ==='vue' && this.isInheritWebComponent( parent ) ){
                return `${this.getModuleReferenceName(parent)}.prototype._init`;
            }
            return this.getModuleReferenceName(parent);
        }
        return this.getModuleReferenceName(parent);
    }
}

module.exports = SuperExpression;