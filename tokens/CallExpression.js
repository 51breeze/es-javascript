const Token = require("../core/Token");
class CallExpression extends Token{
    createChildren(stack){
        this.callee= this.createToken(stack.callee);
        this.arguments = stack.arguments.map(item=>this.createToken(item) );
    }
    make( gen ){
        gen.withCall(this.callee, this.arguments);
    }
}
module.exports = CallExpression;