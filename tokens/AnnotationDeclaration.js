const Token = require("../core/Token");
class AnnotationDeclaration extends Token{
    get name(){
        return  this.stack.name;
    }

    getArguments(){
        this.stack.getArguments();
    }
}
module.exports = AnnotationDeclaration;