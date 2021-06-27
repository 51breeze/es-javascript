const Syntax = require("../core/Syntax");
class PackageDeclaration extends Syntax{

    builderExternal(syntax){
        const stack = this.stack;
        if( stack.externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${stack.externals.map( item=>item.emiter(syntax) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }

    emiter(syntax){
        const content = [];
        this.stack.body.forEach( (stack)=>{
            const value = stack.emiter( syntax );
            if( value ){
                content.push( value );
            }
        });
        const external = this.builderExternal(syntax);
        if( external ){
            content.push( external );
        }
        return content.join("\r\n");
    }
}

module.exports = PackageDeclaration;