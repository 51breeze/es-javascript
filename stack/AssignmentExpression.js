const Syntax = require("../core/Syntax");
class AssignmentExpression extends Syntax{
    emitter(){
        const option = this.getConfig();
        const right= this.make(this.stack.right);
        const desc = this.stack.description();
        const module =  this.module;
        const isMember = this.stack.left.isMemberExpression;
        const refType = this.stack.left.type();
        if( refType && refType.isAnyType && isMember ){
            const left = this.make(this.stack.left.object);
            const property = this.stack.left.property.isIdentifier ? this.stack.left.property.value() : this.make(this.stack.left.property);
            const reflect = this.checkRefsName("Reflect");
            this.addDepend( this.stack.getModuleById("Reflect") );
            if( this.stack.left.computed ){
                return `${reflect}.set(${module.id},${left},${property},${right})`;
            }else{
                return `${reflect}.set(${module.id},${left},'${property}',${right})`;
            }
        }
        const left = this.make(this.stack.left);
        if( desc ){
            if( option.target === "es5" && desc.kind ==="set" ){
                return `${left}(${right})`;
            }
            if( isMember && this.stack.left.object.isSuperExpression ){
                return `${left}.call(this,${right})`;
            }
        }
        return `${left}=${right}`;
    }
}
module.exports = AssignmentExpression;