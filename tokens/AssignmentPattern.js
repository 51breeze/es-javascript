const Token = require("../core/Token");
class AssignmentPattern extends Token{
    createChildren(stack){
        this.left = this.createToken( stack.left );
        this.right = this.createToken( stack.right );
    }
    make(gen){
        this.left.make( gen );
        gen.withOperator('=');
        this.right.make( gen );
    }
}
module.exports = AssignmentPattern;