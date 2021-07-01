const Syntax = require("../core/Syntax");
class AssignmentPattern extends Syntax{
    emiter( syntax ){
        const left = this.stack.left.emiter(syntax);
        const right = this.stack.right.emiter(syntax);
        return `${left}=${right}`;
    }
}
module.exports = AssignmentPattern;