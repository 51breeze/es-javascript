const Syntax = require("../core/Syntax");
class PackageDeclaration extends Syntax{

    buildExternal(){
        const stack = this.stack;
        if( stack.externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${stack.externals.map( item=>item.emiter(this) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }

    emiter(){
        const content = [];
        this.stack.body.forEach( (stack)=>{
            const value = stack.emiter( this );
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