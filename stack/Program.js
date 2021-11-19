const Syntax = require("../core/Syntax");
class Program extends Syntax{
    buildExternal(syntax){
        const stack = this.stack;
        if( stack.externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${stack.externals.map( item=>this.make(item) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }
    buildJsx(){
        const root = this.stack.body[0];
        return this.make(root, 0);
    }
    emitter(){
        if( this.compilation.jsx ){
            return this.buildJsx();
        }else{
            return this.stack.body.map(item =>{
                    return this.make(item);
            }).join("\n");
        }
    }
}

module.exports = Program;