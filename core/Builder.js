const fs = require("fs");
const path = require("path");
const SourceMap = require("source-map");
const Generator = require("./Generator");
const Token = require("./Token");
const Polyfill = require("./Polyfill");
const PATH = require("path");
const webComponents = new Map();
const moduleDependencies = new Map();
const moduleIdMap=new Map();
const namespaceMap=new Map();
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
        this.parent = null;
    }

    emitContent(filesystem, module, gen, file, emitFile, flag){
        if( gen ){
            filesystem.mkdirpSync( path.dirname(file) );
            filesystem.writeFileSync(file, gen.toString() );
            if( emitFile ){
                this.emitFile( this.getOutputAbsolutePath(module, flag), filesystem.readFileSync(file) );
                if( gen.sourceMap ){
                    this.emitFile( this.getOutputAbsolutePath(module, flag)+'.map', gen.sourceMap.toString() );
                }
            }
        }
    }

    emitAssets(assets, filesystem, module, emitFile){
        if( !module || !assets )return;
        assets.forEach( asset=>{
            const file = this.getModuleFile( module, asset.id, asset.type, asset.resolve);
            if( !asset.file && asset.type ==="style" ){
                this.emitContent(filesystem, file, asset.content, file);
            }else if( asset.file && asset.resolve ){
                if( fs.existsSync(asset.resolve) ){
                    const content = fs.readFileSync( asset.resolve );
                    this.emitContent(filesystem, file, content, asset.resolve);
                    if( emitFile ){
                        this.emitFile( this.getOutputAbsolutePath(asset.resolve), content );
                    }
                }else{
                    console.warn( `Assets file the '${asset.file}' is not emit.`);
                }
            }else{
                console.warn( `Assets file the '${asset.file}' is not emit.`);
            }
        });
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
            const compiler    = this.compiler;
            const buildModules = new Set();
            const filesystem  = compiler.getOutputFileSystem( this.name );
            const config      = this.getConfig();

            this.make(compilation, compilation.stack, null, filesystem, config.emitFile);
            compilation.modules.forEach( module =>{
                this.getDependencies(module).forEach( depModule=>{
                    if( this.isNeedBuild(depModule) && !buildModules.has(depModule) ){
                        buildModules.add(depModule);
                        const compilation = depModule.compilation;
                        if( depModule.isDeclaratorModule ){
                            const stack = compilation.getStackByModule(depModule);
                            if( stack ){
                                this.make(stack.compilation, stack, depModule, filesystem, config.emitFile);
                            }else{
                                throw new Error(`Not found stack by '${depModule.getName()}'`);
                            }
                        }else{
                            this.make(compilation, compilation.stack, depModule, filesystem, config.emitFile);
                        }
                    }
                });
            });

            buildModules.forEach(module=>{
                module.compilation.completed(this.name,true);
            });

            compilation.completed(this.name,true);
            done();

        }catch(e){
            done(e);
        }
    }

    make(compilation, stack, module, filesystem, emitFile){
        if(compilation.completed(this.name))return;
        const ast = this.createAstToken(stack);
        const gen = ast ? this.createGenerator(ast, compilation) : null;
        const isRoot = compilation.stack === stack;
        if( gen ){
            const file = isRoot ? compilation.file : this.getModuleFile( module );
            const content = gen.toString();
            if( content ){
                filesystem.mkdirpSync( path.dirname(file) );
                filesystem.writeFileSync(file, content );
                if( emitFile ){
                    const output = isRoot ? this.getOutputAbsolutePath(compilation.file) : this.getOutputAbsolutePath(module);
                    this.emitFile( output, content );
                    if( gen.sourceMap ){
                        this.emitFile( output+'.map', gen.sourceMap.toString() );
                    }
                }
            } 
        }

        if( isRoot ){
            compilation.modules.forEach( module=>{
                this.emitAssets(module.assets, filesystem, module, emitFile)
            });
            this.emitAssets(compilation.assets, filesystem, compilation, emitFile);
        }else if( module ){
            this.emitAssets(module.assets, filesystem, module, emitFile);
        }
    }

    build(done){
        const compilation = this.compilation;
        const compiler    = this.compiler;
        const config      = this.getConfig();
        const filesystem  = compiler.getOutputFileSystem( this.name );
        const make = (compilation, stack, module, file, flag )=>{
            const ast = this.createAstToken(stack);
            if( ast ){
                this.emitContent(filesystem, module, this.createGenerator(ast,compilation), file, config.emitFile, flag);
                if( module ){
                    this.emitAssets(filesystem, module, config.emitFile);
                }
            }
        }
        if( compilation.completed(this.name) ){
            return done();
        }
        try{
            compilation.completed(this.name,false);
            if( compilation.modules.size >0 ){
                compilation.modules.forEach( module =>{
                    if( this.isNeedBuild(module) ){
                        const stack = compilation.getStackByModule(module);
                        if( stack ){
                            make(stack.compilation, stack, module, this.getModuleFile(module) );
                        }else{
                            throw new Error(`Not found stack by '${module.getName()}'`);
                        }
                    }
                });
            }else{
                make(compilation, compilation.stack, null, compilation.file, true);
            }
            compilation.completed(this.name,true);
            done();
        }catch(e){
            done(e);
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
        ctxModule = ctxModule || this.module;
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
        const options = this.getOptions();
        return name === options.env;
    }

    getOutputAbsolutePath(module){
        const options = this.getOptions();
        const config = this.getConfig();
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

    getOptions(){
        return this.compiler.options || {};
    }
    
    getConfig( name ){
        const config = this.plugin.config();
        if( name ){
            if( name.lastIndexOf(".") > 0 ){
                const keys = name.split('.');
                let object = config;
                do{
                    if( typeof object !=="object" ){
                        return null;
                    }
                    object = object[ keys.shift() ] || null;
                }while( keys.length > 0 );
                return object;
            }
            return config[name];
        }
        return config;
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
        ctxModule = ctxModule || this.module;
        if( !depModule.isModule || depModule === ctxModule )return;
        if( !this.compiler.callUtils("isTypeModule", depModule) )return;
        var dataset = moduleDependencies.get(ctxModule);
        if( !dataset ){
            moduleDependencies.set( ctxModule, dataset = new Set() );
        }
        dataset.add( depModule );
    }

    getDependencies( ctxModule ){
        ctxModule = ctxModule || this.module;
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

    isActiveForModule(depModule,ctxModule){
        ctxModule = ctxModule || this.module;
        if( this.compilation.isPolicy(2,depModule) ){
            return false;
        }
        const isUsed = this.isUsed(depModule, ctxModule);
        if( !isUsed )return false;
        const isRequire = this.compiler.callUtils("isLocalModule", depModule) && !this.compiler.callUtils("checkDepend",ctxModule, depModule);         
        const isPolyfill = depModule.isDeclaratorModule && Polyfill.modules.has( depModule.getName() );
        return isRequire || isPolyfill;
    }

    getModuleFile(module, uniKey, type, resolve){
        return this.compiler.normalizeModuleFile(module, uniKey, type, resolve);
    }

    getModuleReferenceName(module,context){
        context = context || this.module;
        if( !module )return null;
        if( context ){
            return context.getReferenceNameByModule( module );
        }
        return module.getName("_");
    }

    getProgramAssets(){
        const dataset = new Map();
        const config = this.getConfig();
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
                    const source = this.getModuleImportSource(asset.resolve || asset.file, module || context );
                    dataset.set(source,{
                        source:source,
                        local:asset.assign,
                        resolve:asset.resolve,
                        module,
                        type:'assets'
                    });
                }
            }else if( asset.type ==="style" && module ){
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
        const config = this.getConfig();
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
        const config = this.getConfig();
        const isString = typeof source === 'string';
        if( config.useAbsolutePathImport ){
            return isString ? source : this.getModuleFile(source);
        }
        if( isString && source.includes('/node_modules/') ){
            return source;
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

    getJsxCreateElementHandle(){
        return 'createElement';
    }

    getJsxCreateElementRefs(){
        return 'this.createElement.bind(this)';
    }

    isInheritWebComponent(classModule){
        if( webComponents.has(classModule) ){
            return webComponents.get(classModule);
        }
        while( classModule ){
            const stack = this.compilation.getStackByModule( classModule );
            if( stack && stack.annotations  && Array.isArray(stack.annotations) ){
                if( stack.annotations.some( item=>item.name.toLowerCase() === 'webcomponent' ) ){
                    webComponents.set(classModule, true);
                    return true;
                }
            }
            classModule=classModule.inherit;
        }
        webComponents.set(classModule, false);
        return false;
    }

    createAstToken( stack ){
        return this.createToken( stack );
    }

    createGenerator(ast, compilation ){
        var sourceMap = this.getConfig('sourceMap');
        if( sourceMap ){
            if( sourceMap === true ){
                sourceMap = new SourceMap.SourceMapGenerator();
                sourceMap.setSourceContent(compilation.file, compilation.source);
            }
        }
        const gen = new Generator(compilation.file, sourceMap);
        gen.make( ast );
        return gen;
    }

}

module.exports = Builder;