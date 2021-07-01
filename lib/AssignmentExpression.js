const Syntax = require("../core/Syntax");
class AssignmentExpression extends Syntax{
    emiter( syntax ){
       
        const option = this.getConfig();
        const right= this.stack.right.emiter(syntax);
        const desc = this.stack.description();
        const module =  this.module;

        if( desc.isAnyType ){
            if( this.stack.left.isMemberExpression ){
                if( this.stack.left.computed ){
                   const left = this.stack.left.object.emiter(syntax);
                   const property = this.stack.left.property.isIdentifier ? this.stack.left.property.value() : this.stack.left.property.emiter(syntax);
                   const reflect = this.checkRefsName("Reflect");
                   module.addDepend( this.stack.getModuleById("Reflect") );
                   return `${reflect}.set(${module.id},${left},${property},${right})`;
                }
            }
        }

        const left = this.stack.left.emiter(syntax);
        if( option.target === "es5" && desc.kind ==="set" ){
            return `${left}(${right})`;
        }
        if( this.stack.left.isMemberExpression && this.stack.left.object.isSuperExpression ){
            return `${left}.call(this,${right})`;
        }

        return `${left}=${right}`;
    }
}
module.exports = AssignmentExpression;