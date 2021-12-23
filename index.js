const fs = require("fs");
const path = require("path");
const Plugins = require("./core/Plugins");
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
    "webComponent":"vue",
    "webpack":false,
    "styleLoader":null,
    "reserved":{},
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
const configData = Object.assign({},defaultConfig);
const properties ={
    name:'javascript',
    platform:'client',
    version:require("./package.json").version,
    config(options){
        if(options){
            merge(configData, options);
        }
        return configData;
    },
    getPolyfill(name){},
    getStack(name){
        return modules.get(name);
    },
    start(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        builder.name = this.name;
        builder.platform = this.platform;
        builder.start(done);
    },
    build(compilation, done, options){
        if(options)this.config(options);
        const builder = new Builder( compilation.stack );
        builder.name = this.name;
        builder.platform = this.platform;
        builder.build(done);
    }
}

function registerError(define, cn, en){
    define(10000,'BINDING_PROPERTY_CAN_ONLY_ACCESSOR',[
        '绑定的属性(%s)必须是一个可赋值的成员属性',
        "Binding the '%s' property must be an assignable member property"
    ]);
}

function plugin(complier){
    if( modules.size === 0 ){
        loadStack();
        registerError(complier.diagnostic.defineError, complier.diagnostic.LANG_CN, complier.diagnostic.LANG_EN );
    }
    this.complier = complier;
    complier.loadTypes([require.resolve('./types/web.d.es')],true);
};
plugin.loadStack = loadStack;
plugin.extend=function extend(plugin){
    var checker = [
        {name:'name', type:['string']},
        {name:'platform', type:['string']},
        {name:'version', type:['string','number']},
        {name:'config', type:['function']},
        {name:'getStack', type:['function']},
        {name:'getPolyfill', type:['function']},
        {name:'start', type:['function']},
        {name:'build', type:['function']},
    ];
    if( checker.every(item=>{
        return item.type.includes( typeof plugin[ item.name ] );
    })){
        Plugins.register(plugin.name, plugin);
    }else{
        throw new Error('Plugin invalid');
    }
}

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

Object.defineProperty(plugin,'defaultConfig',{
    get:function(){
        return Object.assign({},defaultConfig);
    },
    enumerable:true,
    configurable:false
});

plugin.extend(properties);
module.exports = plugin;