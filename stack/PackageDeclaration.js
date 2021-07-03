const Syntax = require("../core/Syntax");
class PackageDeclaration extends Syntax{

    buildExternal(){
        const stack = this.stack;
        if( stack.externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${stack.externals.map( item=>this.make(item) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }

    emitter(){
        const content = [];
        this.stack.body.forEach( (stack)=>{
            const value = this.make(stack);
            if( value ){
                content.push( value );
            }
        });
        const external = this.buildExternal();
        if( external ){
            content.push( external );
        }
        return content.join("\r\n");
    }
}

module.exports = PackageDeclaration;