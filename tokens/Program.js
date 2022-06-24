const Syntax = require("../core/Syntax");
class Program extends Syntax{
    buildExternal(){
        const stack = this.stack;
        if( stack && stack.externals.length > 0 ){
            const externals = stack.externals.map( item=>this.make(item) ).filter(item=>!!item);
            if( externals.length > 0 ){
                const refs = [];
                this.addDepend( this.getGlobalModuleById('Class') );
                this.createDependencies(null,refs)
                return refs.concat([ 
                    this.semicolon('/*externals code*/'),
                    this.semicolon(`(function(){\r\n\t${externals.join("\r\n\t")}\r\n}())`)
                ]).join("\r\n");
            }
        }
        return null;
    }
    buildJsx(){
        const root = this.stack.body[0];
        return this.make(root, 0);
    }
    emitter(){
        if( this.compilation.JSX ){
            return this.buildJsx();
        }else{
            return this.buildExternal();
        }
    }
}

module.exports = Program;