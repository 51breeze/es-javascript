const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const merge = require("lodash/merge");
const modules = new Map();
const dirname = path.join(__dirname,"tokens");
fs.readdirSync( dirname ).forEach( (filename)=>{
    const info = path.parse( filename );
    modules.set(info.name, require( path.join(dirname,filename) ) );
});

const defaultConfig ={
    webpack:false,
    reserved:[],
    module:'es',
    emitFile:false,
    suffix:'.js',
    strict:true,
    babel:false,
    ns:'core',
    hot:false,
    sourceMaps:false,
    useDefineProperty:false,
    useAbsolutePathImport:false,
    metadata:{
        env:{}
    },
    crossDependenciesCheck:true,
    context:{
        include:null,
        exclude:null,
        only:false
    },
    rawJsx:{
        enable:false,
        jsx:false,
        delimit:{
            expression:{
                left:'{{',
                right:'}}'
            },
            attrs:{
                left:'"',
                right:'"'
            }
        },
        component:{
            prefix:'',
            resolve:null
        }
    },
    enablePrivateChain:true,
    thisComplete:true,
    resolve:{
        mapping:{}
    },
    dependences:{
        externals:[],
        includes:[],
        excludes:[],
    }
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

    define(10101,'',[
        '路由参数(%s)的默认值只能是一个标量',
        "Route params the '%s' defalut value can only is a literal type."
    ]);
}

const privateKey = Symbol('privateKey')
class PluginEsJavascript{

    constructor(complier,options){
        this.complier = complier;
        this.options = merge({
            metadata:{
                env:merge({}, complier.options.env)
            }
        },defaultConfig, options);
        if( this.options.sourceMaps ){
            complier.options.parser.locations = true;
        }
        if( this.options.workspace ){
            complier.setWorkspace( this.options.workspace );
        }
        this.generatedCodeMaps = generatedCodeMaps;
        this.generatedSourceMaps = generatedSourceMaps;
        this.name = pkg.name;
        this.version = pkg.version;
        this.platform = 'client';
        if( !complier.options.scanTypings ){
            const dir = path.join(__dirname,'types');
            const files = fs.readdirSync( dir ).filter( item=>!(item === '.' || item === '..') ).map( item=>path.join(dir,item) );
            complier.loadTypes(files, {
                scope:'es-javascript',
                inherits:[]
            });
        }
        registerError(complier.diagnostic.defineError, complier.diagnostic.LANG_CN, complier.diagnostic.LANG_EN );
        this[privateKey] = {
            builders:new Map()
        }
    }

    getGeneratedCodeByFile(file){
        return this.generatedCodeMaps.get(file);
    }

    getGeneratedSourceMapByFile(file){
        return this.generatedSourceMaps.get(file);
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

    getBuilder( compilation, builderFactory=Builder){
        let builder = this[privateKey].builders.get(compilation);
        if(builder)return builder;
        builder = new builderFactory( compilation );
        builder.name = this.name;
        builder.platform = this.platform;
        builder.plugin = this;
        this[privateKey].builders.set(compilation,builder);
        return builder;
    }

    toString(){
        return pkg.name;
    }
}

PluginEsJavascript.toString=function toString(){
    return pkg.name;
}

module.exports = PluginEsJavascript;