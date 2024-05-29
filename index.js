const fs = require("fs");
const path = require("path");
const Builder = require("./core/Builder");
const Glob = require("glob-path");
const merge = require("lodash/merge");
const modules = new Map();
const dirname = path.join(__dirname,"tokens");
const BuildModule = require('./core/BuildModule')
const Assets = require('./core/Assets')

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
    useAbsolutePathImport:true,
    routePathWithNamespace:{
        server:false,
        client:true,
    },
    mode:process.env.NODE_ENV || 'production', //production,development
    metadata:{
        env:{
            NODE_ENV:process.env.NODE_ENV || 'production'
        }
    },
    formation:{
        route:null
    },
    crossDependenciesCheck:true,
    context:{
        include:null,
        exclude:null,
        only:false
    },
    hooks:{
        annotations:{
            assignmentValue:()=>null
        }
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
        imports:{},
        folders:{}
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

function registerError(define){
    if(registerError.loaded)return;
    registerError.loaded=true;
    define(10000,'',[
        '绑定的属性(%s)必须是一个可赋值的成员属性',
        "Binding the '%s' property must be an assignable members property"
    ]);

    define(10101,'',[
        '路由参数(%s)的默认值只能是一个标量',
        "Route params the '%s' defalut value can only is a literal type."
    ]);
}

const cache = Object.create(null);
const getCache = (name)=>{
    return cache[name] || (cache[name]=new Map());
}

class PluginEsJavascript{

    constructor(complier,options){
        this.complier = complier;
        this.options = merge({},defaultConfig, options);
        this.options.metadata.version = pkg.version;
        this.options.metadata.js = pkg.version;
        this.generatedCodeMaps = generatedCodeMaps;
        this.generatedSourceMaps = generatedSourceMaps;
        this.name = pkg.name;
        this.version = pkg.version;
        this.platform = 'client';
        registerError(complier.diagnostic.defineError);
        if(this.options.emitFile){
            this.options.useAbsolutePathImport=false;
        }
        this.glob=new Glob();
        this.addGlobRule(); 
        complier.on('onChanged', (compilation)=>{
            getCache(this.platform).delete(compilation)
        });
    }

    addGlobRule(){
        const imports = this.options.resolve?.imports || {};
        Object.keys(imports).forEach( key=>{
            this.glob.addRuleGroup(key, imports[key], 'imports')
        });

        const folders = this.options.resolve?.folders || {};
        Object.keys(folders).forEach( key=>{
            this.glob.addRuleGroup(key, folders[key],'folders');
        })
    }

    resolveImportSource(id, ctx={}){
        const scheme = this.glob.scheme(id,ctx);
        let source = this.glob.parse(scheme, ctx);
        let rule = scheme.rule;
        if(!rule){
            source = id;
        }
        return {
            source
        }
    }

    resolveSourceId(id, group, delimiter='/'){
        let data = {group, delimiter, failValue:null};
        if(typeof group !=='string'){
            data = group;
        }
        return this.glob.dest(id, data);
    }

    getGeneratedCodeByFile(file){
        return this.generatedCodeMaps.get(file);
    }

    getGeneratedSourceMapByFile(file){
        return this.generatedSourceMaps.get(file);
    }

    getBuildModule(resourcePath, id=null, ns=''){
        const module = BuildModule.getModuleByResourcePath(resourcePath, ns)
        return module && id ? module.getModule(id) : module;
    }

    getBuildStyle(resourcePath, index=0, ns=''){
        return this.getBuildAssets(resourcePath, index, 'styles', ns)
    }

    getBuildAssets(resourcePath, index=0, type=null, ns=''){
        if(type==='style')type = 'styles';
        return Assets.getAsset(resourcePath, type, index, ns);
    }

    createBuildAsset(resourceId, content=null, isFile=null, type=null, ns=''){
        return Assets.create(resourceId, content, isFile, type, ns);
    }

    createBuildModule(resourceId, content, sourceMap, ns=''){
        const buildMod = BuildModule.create(resourceId, ns);
        buildMod.content = content;
        buildMod.sourceMap = sourceMap;
        return buildMod;
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

    getBuilder(compilation, builderFactory=Builder ){
        let dataset = getCache(this.platform);
        let builder = dataset.get(compilation);
        if(builder)return builder;
        builder = new builderFactory(compilation);
        builder.name = this.name;
        builder.platform = this.platform;
        builder.plugin = this;
        dataset.set(compilation, builder);
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