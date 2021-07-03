const Syntax = require("../core/Syntax");
class AssignmentPattern extends Syntax{
    emitter(){
        const left = this.make(this.stack.left);
        const right = this.make(this.stack.right);
        return `${left}=${right}`;
    }
}
module.exports = AssignmentPattern;