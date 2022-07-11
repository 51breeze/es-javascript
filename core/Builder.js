const fs = require("fs");
const path = require("path");
const SourceMap = require("source-map");
const Generator = require("./Generator");
const Token = require("./Token");
const Polyfill = require("./Polyfill");
const PATH = require("path");
const Babel = require('@babel/core');
const Lodash = require('lodash');
const moduleDependencies = new Map();
const moduleIdMap=new Map();
const namespaceMap=new Map();
const createAstStackCached = new WeakSet();
const defaultBabelOps = {
    babelrc:true,
    presets:[
        "@babel/preset-env"
    ],
    plugins:[
        "@babel/plugin-transform-runtime"
    ]
}
class Builder extends Token{

    constructor(stack){
        super( stack.toString() );
        this.stack = stack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.compiler = stack.compiler;
        this.module = stack.module;
        this.builder = this;
        this.plugin = null;
        this.name = null;
        this.platform = null;
        this.filesystem = null;
    }

    emitAssets(assets, module, emitFile){
        if( !module || !assets )return;
        assets.forEach( asset=>{
            const file = this.getModuleFile( module, asset.id, asset.type, asset.resolve);
            if( !asset.file && asset.type ==="style" ){
                this.emitContent(file, asset.content);
            }else if( asset.file && asset.resolve ){
                if( fs.existsSync(asset.resolve) ){
                    const content = fs.readFileSync( asset.resolve );
                    this.emitContent(
                        asset.resolve, 
                        content.toString(), 
                        emitFile ? this.getOutputAbsolutePath(asset.resolve) : null
                    );
                }else{
                    console.warn( `Assets file the '${asset.file}' is not emit.`);
                }
            }else{
                console.warn( `Assets file the '${asset.file}' is not emit.`);
            }
        });
    }

    emitContent(file, content, output=null, sourceMap=null){
        this.plugin.generatedCodeMaps.set(file, content);
        if( sourceMap ){
            this.plugin.generatedSourceMaps.set(file, sourceMap);
        }
        if(output){
            this.emitFile( output, content );
            if( sourceMap ){
                this.emitFile( output+'.map', JSON.stringify(sourceMap) );
            }
        }
    }

    emitFile(file, content){
        if( content=== null )return;
        var dir = file;
        const paths = [];
        while( dir && !fs.existsSync( dir = path.dirname(dir) ) ){
            paths.push( dir );
        }
        while( paths.length > 0 ){
            fs.mkdirSync( paths.pop() );
        }
        fs.writeFileSync(file, content);
    }

    start( done ){
        try{
            const compilation = this.compilation;
            const buildModules = new Set();
            const build = (compilation, stack, module)=>{
                this.make(compilation, stack, module);
                this.getDependencies(module).forEach( depModule=>{
                    if( this.isNeedBuild(depModule) && !buildModules.has(depModule) ){
                        buildModules.add(depModule);
                        const compilation = depModule.compilation;
                        if( depModule.isDeclaratorModule ){
                            const stack = compilation.getStackByModule(depModule);
                            if( stack ){
                                build( compilation, stack, depModule );
                            }else{
                                throw new Error(`Not found stack by '${depModule.getName()}'`);
                            }
                        }else{
                            build(compilation, compilation.stack, depModule);
                        }
                    }
                });
            }

            if( compilation.isDescriptionType ){
                compilation.modules.forEach( module=>{
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        build(compilation, stack, module);
                    }
                })
            }else{
                build(compilation, compilation.stack, Array.from(compilation.modules.values()).shift() );
            }

            buildModules.forEach(module=>{
                module.compilation.completed(this.name,true);
            });

            compilation.completed(this.name,true);
            done(null);

        }catch(e){
            done(e);
        }
    }

    build(done){
        this.filesystem  = this.compiler.getOutputFileSystem( this.name );
        const compilation = this.compilation;
        if( compilation.completed(this.name) ){
            return done(null, this);
        }
        try{
            compilation.completed(this.name,false);
            if( compilation.isDescriptionType ){
                compilation.modules.forEach( module=>{
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        this.make(compilation, stack, module);
                    }
                });
            }else{
                this.make(compilation, compilation.stack, Array.from(compilation.modules.values()).shift() );
            }
            compilation.completed(this.name,true);
            done(null);
        }catch(e){
            done(e);
        }
    }

    make(compilation, stack, module){
        if(createAstStackCached.has(stack) || compilation.completed(this.name) )return;
        createAstStackCached.add( stack );
        const config = this.plugin.options;
        const ast = this.createAstToken(stack);
        const gen = ast ? this.createGenerator(ast, compilation, module) : null;
        const isRoot = compilation.stack === stack;
        if( gen ){
            const file = this.getModuleFile( module || compilation );
            var content = gen.toString();
            var sourceMap = gen.sourceMap ? gen.sourceMap.toJSON() : null;
            if( content ){
                if( config.babel && !compilation.isDescriptionType ){
                    const babelOps = typeof config.babel === 'object' ? Lodash.merge({}, defaultBabelOps, config.babel): defaultBabelOps;
                    if( sourceMap ){
                        babelOps.inputSourceMap = sourceMap;
                        babelOps.sourceMaps = true;
                        babelOps.sourceFileName = this.getOutputAbsolutePath(module ? module : compilation.file);
                    }
                    const result = Babel.transformSync(content, babelOps);
                    content = result.code;
                    if( result.map ){
                        sourceMap = result.map;
                    }
                }
                this.emitContent(
                    file, 
                    content,  
                    config.emitFile ? this.getOutputAbsolutePath(module ? module : compilation.file) : null,
                    sourceMap
                );
            }
        }

        if( isRoot ){
            compilation.modules.forEach( module=>{
                this.emitAssets(module.assets, module, config.emitFile)
            });
            this.emitAssets(compilation.assets, compilation, config.emitFile);
        }else if( module ){
            this.emitAssets(module.assets, module, config.emitFile);
        }
    }

    isNeedBuild(module){
        if(!module)return false;
        if( module.compilation.isPolicy(2,module) ){
            return false;
        }
        return true;
    }

    isUsed(module, ctxModule){
        ctxModule = ctxModule || this.module || this.compilation;
        if( !module )return false;
        if( ctxModule && moduleDependencies.has(ctxModule) && moduleDependencies.get(ctxModule).has(module) ){
            return true;
        }
        return module.compilation === this.compilation;
    }

    getModuleById( id, flag=false ){
        return this.compilation.getModuleById(id, flag);
    }

    getGlobalModuleById( id ){
        return this.compilation.getGlobalTypeById(id);
    }

    isRuntime( name ){
        switch( name.toLowerCase() ){
            case "client" :
                return this.platform === "client";
            case  "server" :
                return this.platform === "server";
        }
        return false;
    }

    isSyntax( name ){
        return name.toLowerCase() === this.name;
    }

    isEnv( name ){
        const options = this.compiler.options;
        return name === options.env;
    }

    getOutputAbsolutePath(module){
        const options = this.compiler.options;
        const config = this.plugin.options;
        const suffix = config.suffix||".js";
        const workspace = config.workspace || this.compiler.workspace;
        const output = config.output || options.output;
        const isStr = typeof module === "string";
        if( !module )return output;
        if( !isStr && module && module.isModule ){
            if( module.isDeclaratorModule ){
                const polyfillModule = Polyfill.modules.get( module.getName() );
                const filename = module.id+suffix;
                if( polyfillModule ){
                    return PATH.join(output,(polyfillModule.namespace||config.ns).replace(/\./g,'/'),filename).replace(/\\/g,'/');
                }
                return PATH.join(output,module.getName("/")+suffix).replace(/\\/g,'/');
            }else if( module.compilation.isDescriptionType ){
                return PATH.join(output,module.getName("/")+suffix).replace(/\\/g,'/');
            }
        }
        let filepath = isStr ? PATH.resolve(output, PATH.relative( workspace, module ) ) : 
        module && module.isModule && this.compiler.normalizePath( module.file ).includes(workspace) ?
        PATH.resolve(output, PATH.relative( workspace, module.file ) ) :
        PATH.join(output,module.getName("/")+suffix).replace(/\\/g,'/') ;

        const info = PATH.parse(filepath);
        if( info.ext === '.es' ){
           return PATH.join(info.dir,info.name+suffix).replace(/\\/g,'/');
        }
        return filepath.replace(/\\/g,'/');
    }

    getOutputRelativePath(module,context){
        const contextPath = this.getOutputAbsolutePath(context);
        const modulePath  = this.getOutputAbsolutePath(module);
        return './'+PATH.relative( PATH.dirname(contextPath), modulePath ).replace(/\\/g,'/');
    }

    getFileRelativePath(currentFile, destFile){
        return './'+PATH.relative( PATH.dirname(currentFile), destFile ).replace(/\\/g,'/');
    }

    checkMetaTypeSyntax( metaTypes ){
        metaTypes = metaTypes.filter( item=>item.name ==="Runtime" || item.name ==="Syntax");
        return metaTypes.length > 0 ? metaTypes.every( item=>{
            const desc = item.description();
            const value = desc.params[0];
            const expect = desc.expect !== false;
            switch( item.name ){
                case "Runtime" :
                    return this.isRuntime(value) === expect;
                case "Syntax" :
                    return this.isSyntax(value) === expect;
            }
            return true;
        }) : true;
    }

    getIdByModule( module ){
        const file = ( typeof module ==='string' ? module : this.getModuleFile(module) ).replace(/\\/g,'/');
        if( !moduleIdMap.has(file) ){
            moduleIdMap.set(file,moduleIdMap.size);
        }
        return moduleIdMap.get(file);
    }

    getIdByNamespace( namespace ){
        if( !namespaceMap.has(namespace) ){
            namespaceMap.set(namespace,namespaceMap.size);
        }
        return namespaceMap.get(namespace);
    }

    addDepend( depModule, ctxModule ){
        ctxModule = ctxModule || this.module || this.compilation;
        if( !depModule.isModule || depModule === ctxModule )return;
        if( !this.compiler.callUtils("isTypeModule", depModule) )return;
        var dataset = moduleDependencies.get(ctxModule);
        if( !dataset ){
            moduleDependencies.set( ctxModule, dataset = new Set() );
        }
        dataset.add( depModule );
    }

    getDependencies( ctxModule ){
        ctxModule = ctxModule || this.module || this.compilation;
        var dataset = moduleDependencies.get(ctxModule);
        if( !dataset ){
            return this.compilation.getDependencies(ctxModule);
        }
        if( !dataset._merged ){
            dataset._merged = true;
            this.compilation.getDependencies(ctxModule).forEach( dep=>{
                dataset.add(dep);
            });
        }
        return Array.from( dataset.values() );
    }

    getPolyfillModule(id){
        return Polyfill.modules.get( id );
    }

    isActiveForModule(depModule,ctxModule){
        ctxModule = ctxModule || this.module;
        if( this.compilation.isPolicy(2,depModule) ){
            return false;
        }
        const isUsed = this.isUsed(depModule, ctxModule);
        if( !isUsed )return false;
        const isRequire = this.compiler.callUtils("isLocalModule", depModule) && !this.compiler.callUtils("checkDepend",ctxModule, depModule);         
        const isPolyfill = depModule.isDeclaratorModule && !!this.getPolyfillModule( depModule.getName() );
        return isRequire || isPolyfill;
    }

    getModuleFile(module, uniKey, type, resolve){
        return this.compiler.normalizeModuleFile(module, uniKey, type, resolve);
    }

    getModuleReferenceName(module,context){
        context = context || this.module;
        if( !module )return null;
        if( context ){
            if( context.isDeclaratorModule ){
                const polyfill = this.getPolyfillModule( context.getName() );
                if( polyfill && polyfill.require.includes( module.getName() ) ){
                    return module.id;
                }
            }
            return context.getReferenceNameByModule( module );
        }
        return module.getName("_");
    }

    getProgramAssets(){
        const dataset = new Map();
        const config = this.plugin.options;
        const externals = config.external;
        const assets = this.compilation.assets;
        this.crateAssetItems(null, dataset, assets, externals, this.compilation.file);
        return Array.from( dataset.values() );
    }

    crateAssetItems(module, dataset, assets, externals, context){
        assets.forEach( asset=>{
            if( asset.file ){
                const external = externals && asset.file ? externals.find( name=>asset.file.indexOf(name)===0 ) : null;
                if( !external ){
                    const source = asset.resolve.includes('/node_modules/') ? asset.file : this.getModuleImportSource(asset.resolve, module || context );
                    dataset.set(source,{
                        source:source,
                        local:asset.assign,
                        resolve:asset.resolve,
                        module,
                        type:'assets'
                    });
                }
            }else if( asset.type ==="style" && module ){
                const config = this.plugin.options;
                const file = this.getModuleFile(module, asset.id, asset.type, asset.resolve);
                const source = (config.styleLoader || []).concat( file ).join('!');
                dataset.set(source,{
                    source:source,
                    resolve:file,
                    module,
                    type:'assets'
                });
            }
        });
    }

    getModuleAssets(module, dataset){
        if(!module || !(module.assets.size > 0 || module.requires.size > 0) )return [];
        dataset = dataset || new Map();
        const config = this.plugin.options;
        const assets = module.assets;
        const externals = config.external;
        if( assets ){
           this.crateAssetItems(module, dataset , assets, externals);
        }

        const requires = module.requires;
        if( requires && requires.size > 0 ){
            requires.forEach( item=>{
                const external = externals && item.from ? externals.find( name=>item.from.indexOf(name)===0 ) : null;
                var source = external || item.from;
                var local = item.key;
                var data = {
                    source,
                    imported:null,
                    local,
                    resolve:item.resolve,
                    extract: !!external,
                    module,
                    type:'requires'
                };
                if( item.extract ){
                    data.extract  = true;
                    if( item.name !== local ){
                        data.imported = local;
                        data.local = item.name;
                    }else{
                        data.local = item.name;
                    }
                }
                dataset.set(source, data);
            });
        }

        this.getDependencies( module ).forEach( dep=>{
            if( !this.isActiveForModule(dep, module) && this.isUsed(dep) ){
                this.getModuleAssets(dep, dataset);
            }
        });

        return Array.from( dataset.values() );
    }

    getModuleImportSource(source,module){
        const config = this.plugin.options;
        const isString = typeof source === 'string';
        if( isString && source.includes('/node_modules/') ){
            return source;
        }
        if( config.useAbsolutePathImport ){
            return isString ? source : this.getModuleFile(source);
        }
        return this.getOutputRelativePath(source, module);
    }

    getAvailableOriginType( type ){
        if( type ){
            const originType = this.compiler.callUtils('getOriginType', type);
            switch( originType.id ){
                case 'String' :
                case 'Number' :
                case 'Array' :
                case 'Function' :
                case 'Object' :
                case 'Boolean' :
                case 'RegExp' :
                    return originType.id;
                default :
            }
        }
        return null;
    }

    createAstToken( stack ){
        return this.createToken( stack );
    }

    createGenerator(ast, compilation, module ){
        var sourceMaps = this.plugin.options.sourceMaps;
        var sourceMapObject = null;
        if( sourceMaps && !( (module && module.isDeclaratorModule) || compilation.isDescriptionType ) ){
            const file = this.getOutputAbsolutePath(module ? module : compilation.file);
            sourceMapObject = new SourceMap.SourceMapGenerator({
                file:file,
                sourceRoot:this.compiler.workspace
            });
            sourceMapObject.setSourceContent(compilation.file, compilation.source);
        }
        const gen = new Generator(compilation.file, sourceMapObject);
        gen.make( ast );
        return gen;
    }
}

module.exports = Builder;