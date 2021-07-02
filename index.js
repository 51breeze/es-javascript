const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const modules = new Map();
const loadLibs=()=>{
    const dirname = path.join(__dirname,"lib");
    fs.readdirSync( dirname ).forEach( (filename)=>{
        const info = path.parse( filename );
        modules.set(info.name, require( path.join(dirname,filename) ) );
    });
}
const Syntax = require("./core/Syntax");
const plugin = {
    name:'javascript',
    platform:'client',
    builder(stack,name){
        const Syntax = modules.get(name);
        if( Syntax ){
            return (new Syntax(stack)).emiter(this);
        }
        return null;
    },
    start(compilation, done){
        if( modules.size === 0 ){
            loadLibs();
        }
        const builder = new Builder( compilation.stack );
        builder.start(done);
    }
};

for(var name in plugin){
    Object.defineProperty(Syntax.prototype, name, {value:plugin[name],enumerable:false,configurable:false} )
}

module.exports = plugin;