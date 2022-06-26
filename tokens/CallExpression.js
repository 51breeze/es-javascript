const Token = require("../core/Token");
class CallExpression extends Token{
    createChildren(stack){
        this.arguments = stack.arguments.map(item=>this.createToken(item) );
        this.callee= this.createToken(stack.callee);
    }
    make( gen ){
        gen.withCall(this.callee, this.arguments);
    }
}
module.exports = CallExpression;