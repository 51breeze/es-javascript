const Constant = require("./Constant");
const Polyfill = require("./Polyfill");
const PATH = require("path");
const Token = require("./Token");
const moduleIdMap=new Map();
const namespaceMap=new Map();
const createdStackData = new Map();
const webComponents = new Map();
const moduleDependencies = new Map();

class Syntax extends Token {

    constructor(stack){
        super(stack.toString());
        this.stack = stack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.compiler = stack.compiler;
        this.module = stack.module;
        this.plugin = null;
        this.name = null;
        this.platform = null;
        this.parent = null;
        this.builder = this;
    }

    isUsed(module, ctxModule){
        ctxModule = ctxModule || this.module;
        if( !module )return false;
        if( moduleDependencies.has(ctxModule) && moduleDependencies.get(ctxModule).has(module) ){
            return true;
        }
        return module.compilation === this.compilation || module.compilation.isMain;
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

    make(stack){
       return super.createToken( stack );
    }

    error(message , stack=null){
        if( stack===null ){
            stack = this.stack;
        }
        const range = this.compilation.getRangeByNode(stack.node);
        const file  = this.compilation.file;
        message+= ` (${file}:${range.start.line}:${range.start.column})`;
        this.compiler.callUtils("error",message);
    }

    warn(message , stack=null){
        if( stack===null ){
            stack = this.stack;
        }
        const range = this.compilation.getRangeByNode(stack.node);
        const file  = this.compilation.file;
        message+= ` (${file}:${range.start.line}:${range.start.column})`;
        this.compiler.callUtils("warn",message);
    }
}

module.exports = Syntax;