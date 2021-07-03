const Syntax = require("../core/Syntax");
class Program extends Syntax{
    buildExternal(syntax){
        const stack = this.stack;
        if( stack.externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${stack.externals.map( item=>this.make(item) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }
    emitter(){
       return this.stack.body.map(item =>{
            return this.make(item);
       }).join("\n");
    }
}

module.exports = Program;