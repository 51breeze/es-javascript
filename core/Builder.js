const fs = require("fs");
const path = require("path");
const SourceMap = require("source-map");
const Generator = require("./Generator");
const Token = require("./Token");
const Polyfill = require("./Polyfill");
const PATH = require("path");
const Babel = require('@babel/core');
const Lodash = require('lodash');
const defaultBabelOps = {
    babelrc:true,
    presets:[
        "@babel/preset-env",
    ],
    plugins:[
        "@babel/plugin-transform-runtime"
    ],
    caller:{
        name: 'es-javascript',
        supportsStaticESM: true,
        supportsDynamicImport: true,
        supportsTopLevelAwait: true,
        supportsExportNamespaceFrom: true
    }
}

const ExpressionTokenMaps = {
    '>=':'egt',
    '<=':'elt',
    '!=':'neq',
    '>':'gt',
    '<':'lt',
    '=':'eq',
}
const ExpressionTokens = ['>=','<=','!=','>','<','='];
const ResolveNamedMembers = {};
const ResolveInvokeMembers = {};
const ModuleMapIds=new Map();

class Builder extends Token{

    constructor(compilation){
        super('Program');
        this.stack = compilation.stack;
        this.scope = compilation.scope;
        this.compilation = compilation;
        this.compiler = compilation.compiler;
        this.builder = this;
        this.plugin = null;
        this.name = null;
        this.platform = null;
        this.filesystem = null;
        this.buildModules = new Set();
        this.buildAstCache = new WeakSet();
        this.assets = new Map();
        this.moduleReferenceNameMap = new Map();
        this.moduleDependencies = new Map();
        this.namespaceMap=new Map();
        this.importReferencesMap= new Map();
        this.generatedVarRefs = new Map();
        this.scopeVarCache = new Map();
        this.routeCache=new Map();
    }

    clear(){
        this.buildModules.clear();
        this.assets.clear();
        this.moduleReferenceNameMap.clear();
        this.moduleDependencies.clear();
        this.namespaceMap.clear();
        this.importReferencesMap.clear();
        this.generatedVarRefs.clear();
        this.scopeVarCache.clear();
        this.routeCache.clear();
    }

    addAsset(module,source,type,meta){
        let dataset = this.assets.get( module );
        if( !dataset ){
            this.assets.set(module, dataset={});
        }
        dataset[source] = {type, source, meta};
        return true
    }
    getAsset(module){
        return this.assets.get( module ) || {};
    }

    emitAssets(assets, module, emitFile){
        if( !module || !assets )return;
        assets.forEach( asset=>{
            if( !asset.file && asset.type ==="style" ){
                const file = this.getModuleFile( module, asset.id, asset.type, asset.resolve);
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
                   //console.warn( `Assets file the '${asset.file}' is not emit.`);
                }
            }else{
                //console.warn( `Assets file the '${asset.file}' is not emit.`);
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

    buildForModule(compilation, stack, module){
        if(!compilation)return;
        this.make(compilation, stack, module);
        this.getDependencies(module||compilation).forEach( depModule=>{
            if( depModule && (this.isNeedBuild(depModule, module) && !this.buildModules.has(depModule))){
                this.buildModules.add(depModule);
                const compilation = depModule.compilation;
                if( depModule.isDeclaratorModule ){
                    const stack = compilation.getStackByModule(depModule);
                    if( stack ){
                        this.buildForModule( compilation, stack, depModule );
                    }else{
                        throw new Error(`Not found stack by '${depModule.getName()}'`);
                    }
                }else{
                    this.buildForModule(compilation, compilation.stack, depModule);
                }
            }
        });
    }

    start( done ){
        try{
            this.clear();
            const compilation = this.compilation;
            if( compilation.isDescriptorDocument() ){
                compilation.modules.forEach( module=>{
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        this.buildForModule(compilation, stack, module);
                    }
                })
            }else{
                this.buildForModule(compilation, compilation.stack, Array.from(compilation.modules.values()).shift() );
            }

            this.buildModules.forEach(module=>{
                module.compilation.completed(this.plugin,true);
            });

            compilation.completed(this.plugin,true);
            done(null,this);

        }catch(e){
            done(e,this);
        }
    }

    build(done){
        this.filesystem  = this.compiler.getOutputFileSystem( this.plugin );
        const compilation = this.compilation;
        if( compilation.completed(this.plugin) ){
            return done(null, this);
        }
        try{
            this.clear();
            compilation.completed(this.plugin,false);
            if( compilation.isDescriptorDocument() ){
                compilation.modules.forEach( module=>{
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        this.make(compilation, stack, module);
                    }
                });
            }else{
                this.make(compilation, compilation.stack, Array.from(compilation.modules.values()).shift() );
            }
            compilation.completed(this.plugin,true);
            done(null, this);
        }catch(e){
            done(e, this);
        }
    }

    make(compilation, stack, module, flag=false){
        if( !flag && compilation.completed(this.plugin) )return;
        if(this.buildAstCache.has(stack))return;
        this.buildAstCache.add(stack);
        const config = this.plugin.options;
        const ast = this.createAstToken(stack);
        const gen = ast ? this.createGenerator(ast, compilation, module) : null;
        const isRoot = compilation.stack === stack;
        if( gen ){
            const file = this.getModuleFile( module || compilation );
            var content = gen.toString();
            var sourceMap = gen.sourceMap ? gen.sourceMap.toJSON() : null;
            if( content ){
                if( config.babel ){
                    const result = this.babelTransformSync(
                        content, 
                        sourceMap, 
                        typeof config.babel === 'object' ? Lodash.merge({}, defaultBabelOps, config.babel): Object.assign({}, defaultBabelOps),
                        module,
                        stack,
                        compilation
                    );
                    if(result){
                        content = result.content;
                        sourceMap = result.sourceMap;
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

    babelTransformSync(content, sourceMap, babelOps, module, stack, compilation){
        if( sourceMap ){
            babelOps.inputSourceMap = sourceMap;
            babelOps.sourceMaps = true;
            babelOps.sourceFileName = this.getOutputAbsolutePath(module ? module : compilation.file);
        }
        try{
            const result = Babel.transformSync(content, babelOps);
            content = result.code;
            if( result.map ){
                sourceMap = result.map;
            }
        }catch(e){
            console.error( e );
        }
        return {
            content,
            sourceMap
        };
    }

    isNeedBuild(module, ctxModule){
        if(!module || !this.compiler.callUtils('isTypeModule', module))return false;
        if( !this.isActiveForModule(module, ctxModule) )return false;
        if( !this.isPluginInContext(module) ){
            return false;
        }
        return true;
    }

    isUsed(module, ctxModule){
        ctxModule = ctxModule || this.compilation;
        if( !module )return false;
        if( ctxModule && this.moduleDependencies.has(ctxModule) && this.moduleDependencies.get(ctxModule).has(module) ){
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
        const metadata = this.plugin.options.metadata || {};
        switch( name.toLowerCase() ){
            case "client" :
                return (metadata.platform || this.platform) === "client";
            case  "server" :
                return (metadata.platform || this.platform) === "server";
        }
        return false;
    }

    isSyntax( name ){
        return name && name.toLowerCase() === this.name;
    }

    isEnv(name, value){
        const metadata = this.plugin.options.metadata;
        const env = metadata.env || {};
        if( value !== void 0 ){
            return env[name] === value;
        }
        return false;
    }

    isVersion(name, version, operator='elt', flag=false){
        const metadata = this.plugin.options.metadata;
        const right = String(metadata[name] || '0.0.0').trim();
        const left = String(version || '0.0.0').trim();
        const rule = /^\d+\.\d+\.\d+$/;
        if( !rule.test(left) || !rule.test(right) ){
            console.warn('Invalid version. in check metadata');
            return false;
        }
        if( flag ){
            return this.isCompareVersion(right, left, operator);
        }
        return this.isCompareVersion(left, right, operator);
    }

    isCompareVersion(left, right, operator='elt'){
        operator = operator.toLowerCase();
        if( operator === 'eq' && left == right)return true;
        if( operator === 'neq' && left != right)return true;
        const toInt = (val)=>{
            val = parseInt(val);
            return isNaN(val) ? 0 : val;
        }
        left = String(left).split('.',3).map( toInt );
        right = String(right).split('.',3).map( toInt );
        for(let i=0;i<left.length;i++){
            let l = left[i] || 0;
            let r = right[i] || 0;
            if( operator === 'eq' ){
                if( l != r ){
                    return false;
                }
            }else{
                if( l != r ){
                    if( operator === 'gt' && !(l > r) ){
                        return false;
                    }else if( operator === 'egt' && !(l >= r) ){
                        return false;
                    }else if( operator === 'lt' && !(l < r) ){
                        return false;
                    }else if( operator === 'elt' && !(l <= r) ){
                        return false;
                    }else if( operator === 'neq' ){
                        return true;
                    }
                    return true;
                }
            }
        }
        return operator === 'eq' || operator === 'egt' || operator === 'elt';
    }

    getClassMemberName(stack, name=null){
        if( !stack || !stack.isStack || !(stack.isMethodDefinition || stack.isPropertyDefinition) )return name;
        let id = null;
        if(stack.module){
            let raw = name || stack.value();
            id = stack.module.getFullName()+':'+raw;
            if( Object.prototype.hasOwnProperty.call(ResolveNamedMembers,id) ){
                return ResolveNamedMembers[id] || name;
            }
        }
        const result = stack.findAnnotation(stack, (annotation)=>{
            const name = annotation.name.toLowerCase();
            if( name ==='alias'){
                return annotation;
            }
        });
        let resolevName = name;
        if( result ){
            const [annotation, _stack] = result;
            const args = annotation.getArguments();
            if( args.length > 0) {
                const fristNode = args[0];
                const alias = fristNode.isObjectPattern ? fristNode.extract[0].value : fristNode.value;
                if( args.length > 1 ){
                    const expectVersion = args.find( item=>String(item.key).toLowerCase() ==='version' );
                    if( expectVersion ){
                        if( this.checkExpectVersionExpression( expectVersion.value ) ){
                            resolevName = alias;  
                        }
                    }
                }else{
                    resolevName = alias;
                }
            }
        }
        if( id ){
            ResolveNamedMembers[id] = resolevName;
        }
        return resolevName;
    }

    getClassMemberHook(stack){
        if( !stack || !stack.isStack || !(stack.isMethodDefinition || stack.isPropertyDefinition) )return null;
        let id = null;
        if(stack.module){
            let raw = stack.value();
            id = stack.module.getFullName()+':'+raw;
            if( Object.prototype.hasOwnProperty.call(ResolveInvokeMembers,id) ){
                return ResolveInvokeMembers[id];
            }
        }
        const result = stack.findAnnotation(stack, (annotation)=>{
            const name = annotation.name.toLowerCase();
            if( name ==='hook'){
                return annotation;
            }
        });
        let invoke = null;
        if( result ){
            const [annotation, _stack] = result;
            const args = annotation.getArguments();
            if( args.length >= 1) {
                const getValue = (arg)=>{
                    if( !arg )return null;
                    return arg.isObjectPattern ? arg.extract[0].value : arg.value;
                }
                const type =  getValue( args[0] );
                const version = getValue( args[1] );
                let flag = version ? this.checkExpectVersionExpression( version ) : true;
                if( flag ){
                    invoke=[type, annotation];  
                }
            }else{
                annotation.error(1000, 2, args.length)
            }
        }
        if( id ){
            ResolveInvokeMembers[id] = invoke;
        }
        return invoke;
    }

    checkExpectVersionExpression( str ){
        let expression = str.trim();
        let token = ExpressionTokens.find( (value)=>{
            return expression.includes( value ) || expression.includes( ExpressionTokenMaps[value] );
        });
        let operation = expression.includes(token) ? token : ExpressionTokenMaps[token];
        let value = expression.substring( operation.length ).trim();
        return value && this.isVersion('version', value, ExpressionTokenMaps[token], true);
    }

    getOutputAbsolutePath(module, compilation){
        const options = this.compiler.options;
        const config = this.plugin.options;
        const suffix = config.suffix||".js";
        const workspace = config.workspace || this.compiler.workspace;
        const output = config.output || options.output;
        const isStr = typeof module === "string";
        if( isStr && this.isExternalDependence(module, compilation) ){
            return module;
        }
        const folder = isStr ? this.getSourceFileMappingFolder(module, compilation) : this.getModuleMappingFolder( module );
        if( !module )return output;
        if( !isStr && module && module.isModule ){
            if( module.isDeclaratorModule ){
                const polyfillModule = Polyfill.modules.get( module.getName() );
                const filename = module.id+suffix;
                if( polyfillModule ){
                    return PATH.join(output,(polyfillModule.namespace||config.ns).replace(/\./g,'/'),filename).replace(/\\/g,'/');
                }
                return PATH.join(output,module.getName("/")+suffix).replace(/\\/g,'/');
            }else if( module.compilation.isDescriptorDocument() ){
                return PATH.join(output,module.getName("/")+suffix).replace(/\\/g,'/');
            }
        }
        let filepath = '';
        if( isStr ){
            filepath = PATH.resolve(output, folder ? PATH.join(folder, PATH.parse(module).name+suffix) : PATH.relative( workspace, module ) );
        }else if(module && module.isModule){
            filepath = PATH.resolve(output, folder ? PATH.join(folder, module.id+suffix) :  module.getName("/")+suffix );
        }else if(module && module.file){
            filepath = PATH.resolve(output, folder ? PATH.join(folder, PATH.parse(module.file).name+suffix) : PATH.relative( workspace, module.file) );
        }
        const info = PATH.parse(filepath);
        if( info.ext === '.es' ){
            filepath = PATH.join(info.dir, info.name+suffix);
        }
        return filepath.replace(/\\/g,'/');
    }

    getOutputRelativePath(module,context){
        if( typeof module ==="string" && this.isExternalDependence(module, context) ){
            return module;
        }
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

    ckeckRuntimeOrSyntaxAnnotations(items){
        if( !items || !items.length )return true;
        return items.every( item=>{
            const args = item.getArguments();
            const _expect = this.getAnnotationArgument('expect', args, [,'expect'], true)
            const value = args[0].value;
            const expect = _expect ? _expect.value !== false : true;
            switch( item.name.toLowerCase() ){
                case "runtime" :
                    return this.isRuntime(value) === expect;
                case "syntax" :
                    return this.isSyntax(value) === expect;
            }
            return true;
        });
    }

    getIdByModule( module ){
        if( !ModuleMapIds.has(module) ){
            ModuleMapIds.set(module,ModuleMapIds.size+1);
        }
        return ModuleMapIds.get(module);
    }

    getIdByNamespace( namespace ){
        if( !ModuleMapIds.has(namespace) ){
            ModuleMapIds.set(namespace,ModuleMapIds.size);
        }
        return ModuleMapIds.get(namespace);
    }

    addDepend( depModule, ctxModule ){
        if(!depModule)return;
        ctxModule = ctxModule || this.compilation;
        if( !depModule.isModule || depModule === ctxModule )return;
        if( !this.compiler.callUtils("isTypeModule", depModule) )return;
        var dataset = this.moduleDependencies.get(ctxModule);
        if( !dataset ){
            this.moduleDependencies.set( ctxModule, dataset = new Set() );
        }
        dataset.add( depModule );
        depModule.used = true;
    }

    addImportReference(context, key, importNode ){
        context = context || this.compilation;
        var dataset = this.importReferencesMap.get( context );
        if( !dataset ){
            this.importReferencesMap.set( context, dataset = new Map() )
        }
        const old =  dataset.get(key);
        if( old ){
            if( old.specifiers && importNode.specifiers ){
                importNode.specifiers.forEach( spec=>{
                    const result = old.specifiers.find( item=>{
                        return item.local.value === spec.local.value;
                    });
                    if( !result ){
                        old.specifiers.push(spec);
                    }
                });
            }
        }else{
            dataset.set(key,importNode);
        }
    }

    hasImportReference(context,key){
        context = context || this.compilation;
        const dataset = this.importReferencesMap.get( context );
        if( dataset ){
            return dataset.has(key);
        }
        return false;
    }

    geImportReferences(context){
        return this.importReferencesMap.get( context || this.compilation );
    }

    getDependencies( ctxModule ){
        ctxModule = ctxModule || this.compilation;
        var dataset = this.moduleDependencies.get(ctxModule);
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
        ctxModule = ctxModule || this.compilation;
        const isUsed = this.isUsed(depModule, ctxModule);
        if( !isUsed )return false;
        const isRequire = this.compiler.callUtils("isLocalModule", depModule) && !this.compiler.callUtils("checkDepend",ctxModule, depModule);         
        const isPolyfill = depModule.isDeclaratorModule && !!this.getPolyfillModule( depModule.getName() );
        if( !(isRequire || isPolyfill) )return false;
        if( !this.checkRuntimeModule(depModule) ){
            return false;
        }
        return true;
    }

    checkRuntimeModule(module){
        if( !this.ckeckRuntimeOrSyntaxAnnotations(this.getModuleAnnotations(module, ['runtime', 'syntax'])) ){
            return false;
        }
        return true;
    }

    isPluginInContext(doucment){
        const options = this.plugin.options;
        if(!options.crossDependenciesCheck && options.hot)return true;
        return this.compiler.isPluginInContext(this.plugin, doucment||this.compilation);
    }

    getModuleFile(module, uniKey, type, resolve){
        return this.compiler.normalizeModuleFile(module, uniKey, type, resolve);
    }

    getModuleReferenceName(module,context){
        context = context || this.compilation;
        if( !module || !module.isModule)return null;
        let scope = context || this.compilation;
        let dataset = this.moduleReferenceNameMap.get(scope);
        if(!dataset)this.moduleReferenceNameMap.set(scope, dataset=new Map());
        let name = dataset.get(module);
        if(name)return name;
        if( context && context.isModule){
            if( context.isDeclaratorModule ){
                const polyfill = this.getPolyfillModule( context.getName() );
                if( polyfill && polyfill.references ){
                    const className = module.getName();
                    const result = polyfill.references.find( item=>{
                        return item.from === className
                    });
                    if(result){
                        name = result.local || module.id;
                    }
                }
            }
            if(!name ){
                name = context.getReferenceNameByModule( module );
            }
        }else{
            name = module.getName("_");
        }
        const exists = Array.from( dataset.values() );
        let value = name;
        let index = 1;
        while( exists.some( old=>old===value ) ){
            value = name+(index++);
        }
        dataset.set(module, value);
        return value;
    }

    getProgramAssets(){
        const dataset = new Map();
        const assets = this.compilation.assets;
        this.crateAssetItems(null, dataset, assets, this.compilation.file);
        return Array.from( dataset.values() );
    }

    crateAssetFilter(asset, module, context, dataset){
        return true;
    }

    crateAssetItems(module, dataset, assets, context){
        assets.forEach( asset=>{
            if( !this.crateAssetFilter(asset, module, context, dataset) ){
                return false;
            }
            if( asset.file ){
                if( !this.isExternalDependence(asset.resolve, module) ){
                    const source = this.getModuleImportSource(asset.resolve, module || context , asset.file );
                    dataset.set(source,{
                        source:source,
                        local:asset.assign,
                        resolve:asset.resolve,
                        module,
                        isFile:true,
                        type:'assets',
                        raw:asset
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
                    isFile:false,
                    type:'assets',
                    raw:asset
                });
            }
        });
    }

    getModuleAnnotations(module, allows = ['get','post','put','delete','option','router']){
        if(!module||!module.isClass)return [];
        const stack = module.moduleStack;
        let annotations = stack.annotations;
        if(annotations){
            const result = annotations.filter( annotation=>allows.includes(annotation.name.toLowerCase()));
            if( result.length>0 ){
                return result;
            }
        }
        const inherit = module.inherit
        if( inherit && inherit!== module){
            return this.getModuleAnnotations(inherit, allows);
        }
        return [];
    }

    getAnnotationArgument(name, args=[], indexes=[], lowerFlag=false){
        let index = args.findIndex(item=>lowerFlag ? String(item.key).toLowerCase() === name : item.key===name);
        if( index < 0 ){
            index = indexes.indexOf(name);
            if( index>= 0 ){
                const arg = args[index];
                return arg && !arg.assigned ? arg : null;
            }
        }
        return args[index] || null;
    }

    createRoutePath(route, params={}){
        if(!route||!route.path)return false;
        params = Object.assign({}, route.params||{}, params);
        return '/'+route.path.split('/').map( (segment,index)=>{
            if( segment.charCodeAt(0)===58 ){
                segment = segment.slice(1)
                const optional = segment.charCodeAt(segment.length-1)===63;
                if(optional){
                    segment = segment.slice(0,-1);
                }
                if( params[segment] ){
                    return params[segment]
                }
                if( !optional ) {
                    console.error(`[es-javascript] Route params the "${segment}" missing default value or set optional. on page-component the "${route.path}"`)
                }
                return null;
            }
            return segment;
        }).filter( val=>!!val ).join('/')
    }

    getModuleRoutes(module, allows = ['router']){
        if(!module||!module.isClass)return [];
        if(this.routeCache.has(module))return this.routeCache.get(module);
        const routes = [];
        const annotations = this.getModuleAnnotations(module, allows);
        if( annotations && annotations.length){
            annotations.forEach( annotation=>{
                const args = annotation.getArguments();
                let annotName = annotation.name.toLowerCase();
                let method = annotName;
                if( annotName ==='router' ){
                    method = '*';
                    const methodArg = this.getAnnotationArgument('METHOD', args, []);
                    if(methodArg){
                        method = String(methodArg.value).toLowerCase();
                        if( !allowRouter.includes(method) || method==='router' ){
                            method = '*'
                        }
                    }
                }

                const pathArg = this.getAnnotationArgument('PATH', args, ['PATH']);
                const defaultValue = {};
                const params = args.filter(arg=>!(arg===method || arg===pathArg)).map( item=>{
                    return this.getModuleRouteParamRule(item.assigned ? item.key : item.value, item.stack, defaultValue)
                });

                let pathName =pathArg ? pathArg.value : module.getName('/');
                if(pathName.charCodeAt(0) ===47){
                    pathName = pathName.substring(1)
                }

                if(pathName.charCodeAt(pathName.length-1) ===47){
                    pathName = pathName.slice(0,-1)
                }

                params.unshift(pathName)
                routes.push({
                    name:module.getName('/'),
                    path:'/'+params.join('/'),
                    params:defaultValue,
                    method,
                    file:this.getModuleImportSource(module)
                });

            });
        }
        this.routeCache.set(module, routes);
        return routes;
    }

    getModuleRouteParamRule(name, stack, defaultValue={}){
        let question = stack.question || stack.node.question;
        if(stack.isAssignmentPattern){
            if(!question)question=stack.left.question || stack.left.node.question
            if(stack.right.isIdentifier || stack.right.isLiteral){
                defaultValue[name] = stack.right.value();
            }else{
                const gen = new Generator();
                gen.make(this.createToken(stack.right))
                defaultValue[name] = gen.toString();
            }
        }
        return question ? ':'+name+'?' : ':'+name;
    }

    getModuleAssets(module, dataset, excludes){
        if(!module)return [];
        const isModule = this.compiler.callUtils('isTypeModule', module);
        dataset = dataset || new Map();
        excludes = excludes || new WeakSet();
        const assets = module.assets;
        const compilation = isModule ? module.compilation : module;
        if( assets ){
           this.crateAssetItems(module, dataset , assets);
        }

        if( isModule ){
            if( compilation.modules.size > 1 ){
                if( compilation.mainModule === module ){
                    this.crateAssetItems(module, dataset, compilation.assets);
                }
            }else{
                this.crateAssetItems(module, dataset, compilation.assets);
            }
        }

        const requires = module.requires;
        if( requires && requires.size > 0 ){
            requires.forEach( item=>{
                const source = item.from;
                if( source && !this.isExternalDependence(source, module) ){
                    const local = item.key;
                    const data = {
                        source,
                        imported:null,
                        local,
                        resolve:item.resolve,
                        extract: false,
                        namespaced:!!item.namespaced,
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
                }
            });
        }
        
        // todo 后续再合并
        /*
        if( module.isDeclaratorModule ){
            const polyfillModule = this.getPolyfillModule( module.getName() );
            if( polyfillModule && polyfillModule.requires.size > 0 ){
                polyfillModule.requires.forEach( item=>{
                    const source = item.from;
                    if( source && !this.isExternalDependence(source, module) ){
                        const local = item.key;
                        const data = {
                            source,
                            imported:null,
                            local,
                            resolve:local,
                            extract: false,
                            namespaced:!!item.namespaced,
                            type:'requires'
                        };
                        if( item.extract || item.value && local !== item.value ){
                            data.extract  = true;
                            if( item.value && local !== item.value ){
                                data.imported = local;
                                data.local = item.value;
                            }else{
                                data.imported = local;
                                data.local = local;
                            }
                        }
                        dataset.set(source, data);
                    }
                });
            }
        }*/

        excludes.add(module)

        // this.getDependencies( module ).forEach( dep=>{
        //     if(!excludes.has(dep)){
        //         if( !this.isActiveForModule(dep, module) && this.isUsed(dep) ){
        //             this.getModuleAssets(dep, dataset, excludes);
        //         }
        //     }
        // });

        return Array.from( dataset.values() );
    }

    getModuleImportSource(source, module, identifier){
        const config = this.plugin.options;
        const isString = typeof source === 'string';
        if( isString && source.includes('/node_modules/') ){
            if( path.isAbsolute(source) )return source;
            if( !identifier ){
                return this.getSourceFileMappingFolder(source)||source;
            }
            return identifier || source;
        }
        if( config.useAbsolutePathImport ){
            return isString ? source : this.getModuleFile(source);
        }
        if( isString && !path.isAbsolute(source)){
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

    createAstToken( stack ){
        return this.createToken( stack );
    }

    createGenerator(ast, compilation, module ){
        var sourceMaps = this.plugin.options.sourceMaps;
        var sourceMapObject = null;
        if( sourceMaps && !( (module && module.isDeclaratorModule) || compilation.isDescriptorDocument() ) ){
            const file = this.getOutputAbsolutePath(module ? module : compilation.file);
            sourceMapObject = new SourceMap.SourceMapGenerator({
                file:file,
                sourceRoot:this.compiler.workspace
            });
            sourceMapObject.setSourceContent(compilation.file, compilation.source);
        }
        const gen = new Generator(compilation.file, sourceMapObject);
        gen.builder = this;
        gen.make( ast );
        return gen;
    }


    checkResolveRuleMatch(rule, relative, type, fileExt, fileName){
        rule = rule.replace(/[\s\r\n]+/g,'');
        if( rule.charCodeAt(0) ===47 ){
            rule = rule.substring(1);
        }
        let match = '::'+type;
        let len = match.length;

        if( rule.slice( -len ) !== match )return false;

        rule = rule.slice(0, -len);
        let suffixPos = rule.lastIndexOf('.');
        if( suffixPos>0  ){
            const ruleSuffix = rule.slice( suffixPos );
            if( ruleSuffix !=='.*' && rule.slice( suffixPos ) !== fileExt )return false;
            rule = rule.slice(0, suffixPos);
        }else{
            if( rule.slice(-1) !== '*' )return false;
            rule = rule.slice(0, -1);
        }

        let filenamePos = rule.lastIndexOf('/');
        if( filenamePos >= 0 && rule.slice( filenamePos+1 ) === fileName ){
            rule = rule.slice(0, filenamePos);
        }else{
            let token = rule.slice(-1);
            if( !(token === '*') )return false;
            rule = rule.slice(0, -1);
        }

        if( rule.charCodeAt(rule.length-1)===47 ){
            rule = rule.slice(0,-1);
        }

        const segments = rule.split('/');
        const parts = relative.split('/');
        var rest = false;
        const flag = segments.every( (seg,index)=>{
            if(seg === '**')rest= true;
            return seg === '*' || seg === '**' || parts[index] === seg;
        });

        const count = rest ? segments.length - 1 :  segments.length;
        if( count > parts.length )return false;
        if( flag ){
            if( rest ){
                return [segments, parts];
            }else if( segments.length === parts.length ){
                return [segments, parts];
            }
        }
        return false;
    }

    getSourceFileMappingFolder(file, flag){
        const result = this.resolveSourceFileMappingPath(file, this.plugin.options.resolve.mapping.folder, 'asset');
        return flag && !result ? file : result;
    }

    getModuleMappingFolder(module){
        if( module && module.isModule  ){
            return this.resolveSourceFileMappingPath(module.compilation.file, this.plugin.options.resolve.mapping.folder, 'module');
        }
        return null;
    }

    resolveSourceFileMappingPath(file, mapping, type, delimiter='/'){
        if( type === '*' || !mapping || !file)return null;
        if(mapping[file] !== void 0)return mapping[file];
        const rules = Object.keys(mapping).sort( (a,b)=>{
            const a1 = a.split('/');
            const b1 = b.split('/');
            if(a1.length > b1.length)return -1;
            const aa = a.match(/\*/g),bb = b.match(/\*/g);
            const a2 = aa ? aa.length : 0;
            const b2 = bb ? bb.length : 0;
            if( a2 < b2 )return -1;
            return 0;
        });
        if( !rules.length )return null;
        const hasExt = file.includes('.');
        const fileInfo = PATH.parse( file );
        const relative = fileInfo.dir.replace(/\\+/,'/');
        var filename = fileInfo.name;
        var ext = fileInfo.ext;
        if(type==='asset'){
            if( !hasExt ){
                ext = '.js';
            }
        }
        for( let rule of rules ){
            const result = this.checkResolveRuleMatch( rule, relative, type, ext, filename );
            if( result ){
                if(!mapping[rule])return false;
                const value = mapping[ rule ].replace(/[\s\r\n]+/g,'');
                if( !value.includes('%') )return value;
                const [segments, parts] = result;
                const restMatchPos = segments.findIndex( seg=> seg ==='**' );
                return value.split('/').map( (item)=>{
                    if( item.includes('%') ){
                        return item.split('%').map( key=>{
                            if( key ==='...' && restMatchPos >= 0 ){
                                const range = restMatchPos === segments.length-1 ? parts.slice(restMatchPos, parts.length) : 
                                parts.slice(restMatchPos, parts.length-(segments.length-restMatchPos));
                                return range.join( delimiter );
                            }else if( key==='filename'){
                                return filename;
                            }else if( key==='ext' ){
                                return ext;
                            }
                            return parts[key] || key;
                        }).filter( item=>!!item ).join('');
                    }
                    return item;
                }).filter(item=>!!item).join( delimiter );
            }
        }
        return null;
    }

    isExternalDependence(source, module=null){
        const dependences = this.plugin.options.dependences
        if( dependences && dependences.externals && dependences.externals.length > 0){
            return dependences.externals.some( rule=>{
                if(typeof rule === 'function'){
                    return rule(source, module||this.compilation, this.compilation);
                }else if( rule instanceof RegExp ){
                    return rule.test( source )
                }
                return rule === source;
            });
        }
        return false;
    }

    isExcludeDependence(source, module){
        const dependences = this.plugin.options.dependences
        if( dependences && dependences.excludes && dependences.excludes.length > 0){
            return dependences.excludes.some( rule=>{
                if(typeof rule === 'function'){
                    return rule(source, module, this.compilation);
                }else if( rule instanceof RegExp ){
                    return rule.test( source )
                }
                return rule === source;
            });
        }
        return false;
    }

    isNeedImportDependence(source, module){
        if( this.isExcludeDependence(source, module) ){
            return false;
        }
        return true;
    }

    isRawJsx(){
        const ops = this.plugin.options.rawJsx;
        return ops.enable === true;
    }

    getRawOptions(){
        return this.plugin.options.rawJsx;
    }
}

module.exports = Builder;