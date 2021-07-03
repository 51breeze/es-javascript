const Syntax = require("../core/Syntax");
class Declarator  extends Syntax {
    emitter(){
        let desc = this.stack.description();
        if(desc && this.compiler.callUtils("isTypeModule",desc) ){
            this.module.addDepend( desc );
        }
        return this.stack.value();
    }
}

module.exports = Declarator;