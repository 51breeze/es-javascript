const Syntax = require("../core/Syntax");
class Program extends Syntax{
    buildExternal(syntax){
        const stack = this.stack;
        if( stack.externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${stack.externals.map( item=>item.emiter(syntax) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }
    emiter(syntax){
       return this.stack.body.map(item =>{
            return item.emiter(syntax);
       }).join("\n");
    }
}

module.exports = Program;