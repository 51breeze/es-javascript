const fs = require("fs");
const path = require("path");
const Syntax = require("./core/Syntax");
const Builder = require("./core/Builder");
const {merge} = require("lodash");
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
    "module":'es', //ES CommonJS
    "emitFile":false,
    "suffix":'.js',
    "name":'main.js',
    "pack":false,
    "strict":true,
    "ns":'core',
    'useAbsolutePathImport':false,
}

const profile={
    name:'javascript',
    platform:'client',
    configuration:defaultConfig,
    make(stack){
        const stackModule = modules.get( stack.toString() );
        if( stackModule ){
            return (new stackModule(stack)).emitter();
        }
        throw new Error(`Stack '${stack.toString()}' is not found.`);
    }
}

const properties ={
    name:profile.name,
    platform:profile.platform,
    version:require("./package.json").version,
    config(options){
        const target = Syntax.prototype.configuration;
        if(options){
            merge(target, options);
        }
        return target;
    },
    start(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        builder.start(done);
    },
    build(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        builder.build(done);
    }
}

function plugin(complier){
    if( modules.size === 0 ){
        loadStack();
    }
    this.complier = complier;
    complier.loadTypes([require.resolve('./types/web.es')],true,this);
};

for(var name in profile){
    Object.defineProperty(Syntax.prototype, name, {
        value:profile[name],
        enumerable:false,
        configurable:false
    });
}

for(var name in properties){
    Object.defineProperty(plugin.prototype,name,{
        value:properties[name],
        enumerable:false,
        configurable:false
    });
}

module.exports = plugin;