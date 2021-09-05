const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const Constant = require("./core/Constant");
const modules = new Map();
const loadStack=()=>{
    const dirname = path.join(__dirname,"stack");
    fs.readdirSync( dirname ).forEach( (filename)=>{
        const info = path.parse( filename );
        modules.set(info.name, require( path.join(dirname,filename) ) );
    });
}

const defaultConfig ={
    "target":"es6",
    "useDefineProperty":false,
    "module":Constant.BUILD_REFS_MODULE_ES6,
    "build":Constant.BUILD_ALL_FILE,
    "output":{
        "mode":Constant.BUILD_OUTPUT_MERGE_FILE,
        "suffix":'.js',
        "name":'main.js',
    },
    "strict":true, 
}

const plugin = {
    name:'javascript',
    platform:'client',
    make(stack){
        const stackModule = modules.get( stack.toString() );
        if( stackModule ){
            return (new stackModule(stack)).emitter();
        }
        throw new Error(`Stack '${stack.toString()}' is not found.`);
    }
};

const Syntax = require("./core/Syntax");
for(var name in plugin){
    Object.defineProperty(Syntax.prototype, name, {
        value:plugin[name],
        enumerable:false,
        configurable:false
    });
}

plugin.config=function config(options){
    Syntax.prototype.configuration = Object.assign({}, defaultConfig, Syntax.prototype.configuration||{},  options||{});
}

plugin.start=function start(compilation, done, options){
    this.config(options);
    if( modules.size === 0 ){
        loadStack();
    }
    const builder = new Builder( compilation.stack );
    builder.start(done);
}

module.exports = plugin;