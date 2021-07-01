const Syntax = require("../core/Syntax");
class VariableDeclarator extends Syntax {
    emiter(syntax){
        if( this.stack.isPattern ){
            return this.stack.id.emiter( syntax );
        }else{
            const init = this.stack.init && this.stack.init.emiter(syntax);
            const name = this.stack.id.value();
            if( init ){
                return `${name} = ${init}`;
            }
            return name;
        }
    }
}

module.exports = VariableDeclarator;