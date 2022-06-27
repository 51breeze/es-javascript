const FunctionExpression = require("./FunctionExpression");
class FunctionDeclaration extends FunctionExpression{
    createChildren(stack){
        this.key = this.createToken( stack.key );
    }
}

module.exports = FunctionDeclaration;