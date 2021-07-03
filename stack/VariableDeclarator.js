const Syntax = require("../core/Syntax");
class VariableDeclarator extends Syntax {
    emitter(){
        if( this.stack.isPattern ){
            return this.make(this.stack.id);
        }else{
            const init = this.stack.init && this.make(this.stack.init);
            const name = this.stack.id.value();
            if( init ){
                return `${name} = ${init}`;
            }
            return name;
        }
    }
}

module.exports = VariableDeclarator;