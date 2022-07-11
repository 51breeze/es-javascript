const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const Polyfill = require("./core/Polyfill");
const {merge} = require("lodash");
const modules = new Map();
const dirname = path.join(__dirname,"tokens");
fs.readdirSync( dirname ).forEach( (filename)=>{
    const info = path.parse( filename );
    modules.set(info.name, require( path.join(dirname,filename) ) );
});

const defaultConfig ={
    "webpack":false,
    "reserved":[],
    "module":'cjs',
    "emitFile":false,
    "suffix":'.js',
    "strict":true,
    "babel":false,
    "ns":'core',
    "sourceMaps":false,
    "useDefineProperty":false,
    'useAbsolutePathImport':false,
}

const pkg = require("./package.json");
const generatedCodeMaps = new Map();
const generatedSourceMaps = new Map();

function registerError(define, cn, en){
    if(registerError.loaded)return;
    registerError.loaded=true;
    define(10000,'',[
        '绑定的属性(%s)必须是一个可赋值的成员属性',
        "Binding the '%s' property must be an assignable member property"
    ]);
}

class Plugin{

    constructor(complier,options){
        this.complier = complier;
        this.options = merge({},defaultConfig, options);
        this.generatedCodeMaps = generatedCodeMaps;
        this.generatedSourceMaps = generatedSourceMaps;
        this.name = pkg.name;
        this.version = pkg.version;
        this.platform = 'client'; 
        const dir = path.join(__dirname,'types');
        const files = fs.readdirSync( dir ).filter( item=>!(item === '.' || item === '..') ).map( item=>path.join(dir,item) );
        complier.loadTypes(files,true);
        registerError(complier.diagnostic.defineError, complier.diagnostic.LANG_CN, complier.diagnostic.LANG_EN );
    }

    getGeneratedCodeByFile(file){
        return this.generatedCodeMaps.get(file);
    }

    getGeneratedSourceMapByFile(file){
        return this.generatedCodeMaps.get(file);
    }

    getPolyfillModules( name ){
        if( name ){
            return Polyfill.modules.get(name);
        }
        return Polyfill.modules;
    }

    getTokens(){
        return modules;
    }

    getTokenNode(name){
        return modules.get(name);
    }

    start(compilation, done){
        const builder = this.getBuilder( compilation );
        builder.start(done);
        return builder;
    }

    build(compilation, done){
        const builder = this.getBuilder( compilation );
        builder.build(done);
        return builder;
    } 

    getBuilder( compilation ){
        const builder = new Builder( compilation.stack );
        builder.name = this.name;
        builder.platform = this.platform;
        builder.plugin = this;
        return builder;
    }
}


module.exports = Plugin;