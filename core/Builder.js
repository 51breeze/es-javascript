const fs = require("fs");
const path = require("path");
const SourceMap = require("source-map");
const Generator = require("./Generator");
const Token = require("./Token");
const Polyfill = require("./Polyfill");
const PATH = require("path");
const Babel = require('@babel/core');
const Lodash = require('lodash');
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

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
        this.checkRuntimeCache = new Map();
        this.checkPluginContextCache = new Map();
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
            if(!asset.file && asset.type ==="style"){
                let file = this.getModuleFile( module, asset.id, asset.type, asset.resolve, asset.attrs, 'emitAssets');
                this.emitContent(file, asset.content);
            }else if( asset.file && asset.resolve ){
                if( fs.existsSync(asset.resolve) ){
                    let file = asset.resolve;
                    if(this.isLoadAssetsRawcode(asset.stack, asset.resolve)){
                        file = this.getModuleFile(module, asset.id, 'embedAssets', null, {index:asset.index, ext:asset.type});
                    }
                    let content = fs.readFileSync( asset.resolve , {encoding:'utf-8'});
                    this.emitContent(
                        file, 
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
            if(name.toLowerCase()==='mode'){
                if(this.plugin.options.mode === value || env.NODE_ENV===value){
                    return true;
                }
            }
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
                const indexes = ['name', 'version'];
                const nameArg = this.getAnnotationArgument('name', args, indexes, true)
                const versionArg = this.getAnnotationArgument('version', args, indexes, true)
                const alias = nameArg ? nameArg.value : null;
                const version = versionArg ? versionArg.value : null;
                if(alias){
                    if(version){
                        if( this.checkExpectVersionExpression(version) ){
                            resolevName = alias;
                        }
                    }else{
                        resolevName = alias;
                    }
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
        const expression = str.trim();
        const token = ExpressionTokens.find( (value)=>{
            return expression.includes( value ) || expression.includes( ExpressionTokenMaps[value] );
        });
        if(!token){
            console.error('[ES-JAVASCRIPT] Version expression operator is invalid. availables:'+ExpressionTokens.join(', '))
            return false;
        }
        const operation = expression.includes(token) ? token : ExpressionTokenMaps[token];
        const segs = expression.split(operation, 2).map(val=>val.trim());
        if(!segs[0])segs[0] = 'version';
        if(!segs[segs.length-1])segs[segs.length-1] = 'version';
        const regexp = /^\w+$/;
        const [name, value] = segs.sort((a,b)=>{
            let aa = regexp.test(a) ? 0 : 1;
            let bb = regexp.test(b) ? 0 : 1;
            return aa-bb;
        });
        return this.isVersion(name, value, ExpressionTokenMaps[token], true);
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

    checkRuntimeOrSyntaxAnnotations(items){
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

    checkAnnotationBuildTactics(items){
        if( !items || !items.length )return true;
        return items.every( item=>{
            const name = item.name.toLowerCase();
            if(!['runtime', 'syntax','env','version'].includes(name)){
                return true;
            }
            const args = item.getArguments();
            const indexes = name==='version' ? [,,,'expect'] : (name==='env' ? [,,'expect'] : [,'expect']);
            const _expect = this.getAnnotationArgument('expect', args, indexes, true);
            const value = args[0].value;
            const expect = _expect ? String(_expect.value).trim() !== 'false' : true;
            switch( name ){
                case "runtime" :
                    return this.isRuntime(value) === expect;
                case "syntax" :
                    return this.isSyntax(value) === expect;
                case "env" :{
                    const name = this.getAnnotationArgument('name', args, ['name','value'], true);
                    const value = this.getAnnotationArgument('value', args, ['name','value'], true);
                    if(value && name){
                        return this.isEnv(name.value, value.value) === expect;
                    }else{
                        item.error(`Missing name or value arguments. the '${item.name}' annotations.`);
                    }
                }
                case 'version' :{
                    const name = this.getAnnotationArgument('name', args, ['name','version','operator'], true);
                    const version = this.getAnnotationArgument('version', args, ['name','version','operator'], true);
                    const operator = this.getAnnotationArgument('operator', args, ['name','version','operator'], true);
                    if(name && version){
                        return this.isVersion(name.value, version.value, operator ? operator.value : 'elt') === expect;
                    }else{
                        item.error(`Missing name or version arguments. the '${item.name}' annotations.`);
                    }
                }
            }
            return true;
        });
    }

    getIdByModule( module ){
        const key = module.file + ':'+module.id;
        if( !ModuleMapIds.has(key) ){
            ModuleMapIds.set(key,ModuleMapIds.size+1);
        }
        return ModuleMapIds.get(key);
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
        if(!depModule)return false;
        ctxModule = ctxModule || this.compilation;
        if( !this.isUsed(depModule, ctxModule) )return false;
        if(depModule.isDeclaratorModule){
            return !!this.getPolyfillModule(depModule.getName());
        }else{
            return !this.compiler.callUtils("checkDepend",ctxModule, depModule);   
        }
    }

    isDeclaratorModuleDependency(module){
        if(!module || !module.isClass)return false
        if(module.required && module.isAnnotationCreated){
            return true;
        }else if(module.isDeclaratorModule){
            const stack = module.moduleStack;
            if(stack && stack.imports.length>0){
                return stack.imports.some( item=>{
                    if(item.isImportDeclaration && item.source.isLiteral){
                        return item.specifiers.some(spec=>spec.value() === module.id)
                    }
                    return false;
                });
            }
        }
        return false;
    }

    checkRuntimeModule(module){
        if(this.checkRuntimeCache.has(module)){
            return this.checkRuntimeCache.get(module);
        }
        const result = this.checkAnnotationBuildTactics(this.getModuleAnnotations(module, ['runtime', 'syntax']));
        this.checkRuntimeCache.set(module,result);
        return result;
    }

    checkModuleIsEs6Class(module){
        if(!module || !module.isDeclaratorModule || !module.isClass)return false;
        return this.getModuleAnnotations(module, ['define'], false).some( annot=>{
            const args = annot.getArguments();
            if(args[0])return String(args[0].value).toLowerCase() === 'es6class';
            return false;
        });
    }

    isPluginInContext(module){
        if(this.checkPluginContextCache.has(module)){
            return this.checkPluginContextCache.get(module)
        }
        let result = true;
        if(module && module.isModule && !this.checkRuntimeModule(module) ){
            result = false;
        }else{
            result = this.compiler.isPluginInContext(this.plugin, module||this.compilation);
        }
        this.checkPluginContextCache.set(module,result);
        return result;
    }

    getModuleFile(module, uniKey, type, resolve, attrs=null){
        return this.compiler.normalizeModuleFile(module, uniKey, type, resolve, attrs);
    }

    getModuleReferenceName(module,context){
        context = context || this.compilation;
        if( !module || !module.isModule)return null;
        let scope = this.compilation;
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

    isLoadAssetsRawcode(stack,resolveFile){
        if(!stack || !resolveFile)return false;
        if(!stack.isAnnotationDeclaration)return false;
        if(stack.name.toLowerCase() !== 'embed')return false;
        if(/\.[m|c]?js$/i.test(resolveFile) )return true;
        return resolveFile.endsWith(this.compiler.suffix);
    }

    crateAssetItems(module, dataset, assets, context){
        assets.forEach( asset=>{
            if( !this.crateAssetFilter(asset, module, context, dataset) ){
                return false;
            }
            if( asset.file ){
                if( !this.isExternalDependence(asset.resolve, module) ){
                    let source = '';
                    if(this.isLoadAssetsRawcode(asset.stack, asset.resolve)){
                        source = this.getModuleFile(module, asset.id, 'embedAssets', null, {index:asset.index, ext:asset.type});
                    }else{
                        source = this.getModuleImportSource(asset.resolve, module || context , asset.file );
                    }
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
                const file = this.getModuleFile(module, asset.id, asset.type, asset.resolve, asset.attrs, 'crateAssetItems');
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

    getModuleAnnotations(module, allows = ['get','post','put','delete','option','router'], inheritFlag=true){
        if(!module||!module.isModule||!module.isClass)return [];
        const stacks = module.getStacks();
        for(let i=0;i<stacks.length;i++){
            const stack = stacks[i];
            let annotations = stack.annotations;
            if(annotations){
                const result = annotations.filter( annotation=>allows.includes(annotation.name.toLowerCase()));
                if( result.length>0 ){
                    return result;
                }
            }
        }
        
        const impls = module.extends.concat( module.implements || [] );
        if( impls.length>0 && inheritFlag){
            for(let b=0;b<impls.length;b++){
                const inherit = impls[b];
                if( inherit !== module ){
                    const result = this.getModuleAnnotations(inherit, allows, inheritFlag);
                    if(result.length>0){
                        return result;
                    }
                }
            }
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
        if(isString && module && module.isModule && source.includes('${__filename}')){
            source = source.replace('${__filename}', module.compilation.file);
        }
        if( isString && source.includes('/node_modules/') ){
            if( path.isAbsolute(source) )return source;
            if( !identifier ){
                return this.resolveSourceFileMappingPath(source,'imports')||source;
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

    getImportAssetsMapping(file, options={}){
        if(!options.group){
            options.group = 'imports'
        }
        if(!options.delimiter){
            options.delimiter = '/'
        }
        return this.plugin.resolveImportSource(file, options);
    }

    getSourceFileMappingFolder(file, flag){
        const result = this.resolveSourceFileMappingPath(file, 'folders');
        return flag && !result ? file : result;
    }

    getModuleMappingFolder(module){
        if( module && module.isModule  ){
            return this.resolveSourceFileMappingPath(module.compilation.file, 'folders');
        }
        return null;
    }

    resolveSourceFileMappingPath(file, group, delimiter='/'){
        return this.plugin.resolveSourceId(file, group, delimiter)
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

    createReadfileAnnotationNode(ctx, stack){
        const args = stack.getArguments();
        const depsContext = stack.module || stack.compilation;
        const indexes = ['dir','load','suffix','relative','lazy'];
        const [_path, _load, _suffix, _relative, _lazy] = [
            stack.getAnnotationArgumentItem('dir', args, indexes),
            stack.getAnnotationArgumentItem('load', args, indexes),
            stack.getAnnotationArgumentItem('suffix', args, indexes),
            stack.getAnnotationArgumentItem('relative', args, indexes),
            stack.getAnnotationArgumentItem('lazy', args, indexes),
        ].map( item=>{
            return item ? item.value : null;
        });

        if(!_path){
            return null;
        }

        let dir = String(_path).trim();
        let suffixPattern = null;

        if(dir.charCodeAt(0) === 64){
            dir = dir.slice(1);
            let segs = dir.split('.');
            let precede = segs.shift();
            let latter = segs.pop();
            let options = ctx.plugin[precede];
            if(precede==='options'){
                while(options && segs.length>0){
                    options = options[segs.shift()];
                }
            }
            if(options && Object.prototype.hasOwnProperty.call(options, latter)){
                dir = options[latter];
            }
        }

        if(_suffix){
            _suffix = String(_suffix).trim();
            if(_suffix.charCodeAt(0) === 47 && _suffix.charCodeAt(_suffix.length-1) === 47){
                let index = _suffix.lastIndexOf('/');
                let flags = '';
                if(index>0 && index !== _suffix.length-1){
                    flags = _suffix.slice(index);
                    _suffix = _suffix(0, index);
                }
                _suffix = suffixPattern = new RegExp(_suffix.slice(1,-1), flags);
            }else{
                _suffix = _suffix.split(',').map(item=>item.trim());
            }
        }

        let suffix = _suffix || ['.es', '.json', '.env', '.js'];
        let files = [];
        const checkSuffix=(file)=>{
            if(suffixPattern){
                return suffixPattern.test(filepath);
            }
            return suffix.some( item=>file.endsWith(item) );
        }

        const readdir = (dir)=>{
            if( !fs.existsSync(dir) ){
                return;
            }
            const items = fs.readdirSync(dir);
            if(items){
                items.forEach((file)=>{
                    if(file==='.' || file==='..')return;
                    let filepath = this.compiler.normalizePath(path.join(dir, file));
                    if(fs.statSync(filepath).isDirectory()){
                        files.push(filepath);
                        readdir(filepath);
                    }else if(checkSuffix(filepath)){
                        files.push(filepath);
                    }
                });
            }
        }

        const context = this.compiler.options.workspace;
        const localeCxt = context.toLowerCase();
        const fileMap = {};
        const getParentFile=(pid)=>{
            if( fileMap[pid] ){
                return fileMap[pid]
            }
            if(localeCxt !==pid && pid.includes(localeCxt)){
                return getParentFile(path.dirname(pid))
            }
            return null;
        }

        dir = path.isAbsolute(dir) ? dir : path.join(context, dir);
        readdir(dir);

        if(!files.length)return null;

        files.sort((a,b)=>{
            a = a.replaceAll('.', '/').split('/').length;
            b = b.replaceAll('.', '/').split('/').length;
            return a - b;
        });

        const addDeps=(source, local)=>{
            this.addAsset(depsContext, source, 'assets', {})
            this.addImportReference( 
                depsContext, 
                source, 
                this.createImportDeclaration( 
                    source,
                    local ? [[local]] : []
                )
            );
        }

        const dataset = [];
        const namedMap = new Set()
        files.forEach( file=>{
            const pid = path.dirname(file).toLowerCase();
            const named = path.basename(file,path.extname(file));
            const id = (pid+'/'+named).toLowerCase();
            const filepath = Boolean(_relative)===true ? this.compiler.normalizePath(path.relative(context,file)) : file;
            let item = {
                path:filepath,
                isFile:fs.statSync(file).isFile()
            }

            if(item.isFile && Boolean(_load) === true){
                let data = '';
                if(file.endsWith('.env')){
                    const content = dotenv.parse(fs.readFileSync(file));
                    dotenvExpand.expand({parsed:content})
                    data = JSON.stringify(content);
                }else{
                    if(Boolean(_lazy)===true){
                        data = `import('${file}')`
                    }else{
                        namedMap.add(file);
                        data = '_'+named.replaceAll('-', '_') +namedMap.size;
                        addDeps(file, data);
                    }
                }
                item.content = data;
            }

            const parent = getParentFile(pid);
            if( parent ){
                const children = parent.children || (parent.children = []);
                children.push(item);
            }else{
                fileMap[id+path.extname(file)] = item;
                dataset.push(item);
            }
        });

        const make = (list)=>{
            return list.map( object=>{
                const properties = [ctx.createPropertyNode('path', object.path)];
                if(object.isFile){
                    properties.push(ctx.createPropertyNode('isFile', ctx.createLiteralNode(true)))
                }
                if(object.content){
                    properties.push(ctx.createPropertyNode('content',ctx.createChunkNode(object.content)))
                }
                if(object.children){
                    properties.push(ctx.createPropertyNode('children',ctx.createArrayNode(make(object.children))))
                }
                return ctx.createObjectNode(properties)
            });
        }

        return ctx.createArrayNode(make(dataset))
    }
}

module.exports = Builder;