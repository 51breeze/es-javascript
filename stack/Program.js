const Syntax = require("../core/Syntax");
class Program extends Syntax{
    emiter(syntax){
       return  this.stack.body.map(item =>{
            return item.emiter(syntax);
       }).join("\n");
    }
}

module.exports = Program;