const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const modules = new Map();
const loadStack=()=>{
    const dirname = path.join(__dirname,"stack");
    fs.readdirSync( dirname ).forEach( (filename)=>{
        const info = path.parse( filename );
        modules.set(info.name, require( path.join(dirname,filename) ) );
    });
}
const Syntax = require("./core/Syntax");
const plugin = {
    name:'javascript',
    platform:'client',
    make(stack){
        const Syntax = modules.get( stack.toString() );
        if( Syntax ){
            return (new Syntax(stack)).emitter();
        }
        throw new Error(`Stack '${stack.toString()}' is not found.`);
    },
    start(compilation, done){
        if( modules.size === 0 ){
            loadStack();
        }
        const builder = new Builder( compilation.stack );
        builder.start(done);
    }
};

for(var name in plugin){
    Object.defineProperty(Syntax.prototype, name, {
        value:plugin[name],
        enumerable:false,
        configurable:false
    });
}

module.exports = plugin;