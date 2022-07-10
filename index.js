const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const Polyfill = require("./core/Polyfill");
const {merge} = require("lodash");
const modules = new Map();
const dirname = path.join(__dirname,"transforms");
fs.readdirSync( dirname ).forEach( (filename)=>{
    const info = path.parse( filename );
    modules.set(info.name, require( path.join(dirname,filename) ) );
});

const defaultConfig ={
    "webpack":false,
    "reserved":{},
    "useDefineProperty":false,
    "module":'cjs',
    "emitFile":false,
    "suffix":'.js',
    "strict":true,
    "babel":false,
    "ns":'core',
    "sourceMaps":false,
    'useAbsolutePathImport':false,
}
const package = require("./package.json");
const key = Symbol('configKey');
const properties ={
    name:package.name,
    version:package.version,
    platform:'client',
    config(options){
        const data = this[key] || (this[key] = Object.create(defaultConfig));
        if(options){
            merge(data, options);
        }
        return data;
    },
    getPolyfill(name){
        return Polyfill.modules.get(name);
    },
    getStack(name){
        return modules.get(name);
    },
    start(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        this.builder = builder;
        builder.name = this.name;
        builder.platform = this.platform;
        builder.plugin = this;
        builder.start(done);
    },
    build(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        this.builder = builder;
        builder.name = this.name;
        builder.platform = this.platform;
        builder.plugin = this;
        builder.build(done);
    },
}

function registerError(define, cn, en){
    if(registerError.loaded)return;
    registerError.loaded=true;
    define(10000,'BINDING_PROPERTY_CAN_ONLY_ACCESSOR',[
        '绑定的属性(%s)必须是一个可赋值的成员属性',
        "Binding the '%s' property must be an assignable member property"
    ]);
}

function plugin(complier){
    registerError(complier.diagnostic.defineError, complier.diagnostic.LANG_CN, complier.diagnostic.LANG_EN );
    this.complier = complier;
    const dir = path.join(__dirname,'types');
    const files = fs.readdirSync( dir ).filter( item=>!(item === '.' || item === '..') ).map( item=>path.join(dir,item) );
    complier.loadTypes(files,true);
};

for(var name in properties){
    Object.defineProperty(plugin.prototype,name,{
        value:properties[name],
        enumerable:false,
        configurable:false
    });
    if( ['name','platform','version'].includes(name) ){
        Object.defineProperty(plugin,name,{
            value:properties[name],
            enumerable:false,
            configurable:false
        });
    }
}

Object.defineProperty(plugin,'modules',{
    value:modules,
    enumerable:true,
    configurable:false
});


class Plugin{

    constructor(complier,options){
        this.complier = complier;
        this.options = merge({},  options, defaultConfig);
        this.generatedCodeMaps = new Map();
        this.generatedSourceMaps = new Map();
        this.name = package.name;
        this.version = package.version;
        this.platform = 'client';
    }

    getGeneratedCodeByFile( file ){
        return this.generatedCodeMaps.get( file );
    }

    getGeneratedSourceMapByFile( file ){
        return this.generatedCodeMaps.get( file );
    }

    getPolyfillModules(){
        return Polyfill.modules;
    }

    getTokenModules(){
        return modules;
    }

    getStack(name){
        return modules.get(name);
    }

    start(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        builder.name = this.name;
        builder.platform = this.platform;
        builder.plugin = this;
        builder.start(done);
    }

    build(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        builder.name = this.name;
        builder.platform = this.platform;
        builder.plugin = this;
        builder.build(done);
    } 
}


module.exports = Plugin;