const Constant = require("./Constant");
const Polyfill = require("./Polyfill");
const PATH = require("path");
const events = require('events');
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

    createDataByStack(stack){
        let data = createdStackData.get(stack);
        if( !data ){
            createdStackData.set(stack,data = {});
        }
        return data;
    }

    isUsed(module){
        if( !module )return false;
        return module.used || module.compilation === this.compilation || module.compilation.isMain;
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

    checkRefsName(name){
        // if( this.scope.isDefine(name) ){
        //     const topStack = this.stack.getParentStack(stack=>!!stack.isClassDeclaration);
        //     var classScope = this.scope.getScopeByType("class");
        //     var value = this.generatorVarName(topStack,name);
        //     classScope.dispatcher("insertTopRefsToClassBefore",{name,value});
        //     return value;
        // }
        return name;
    }

    getClassHelper(){
        return Polyfill.modules.get('Class').export;
    }

    getPackModuleRefs(){
        return 'module';
    }

    emitClassAccessKey(){
        const refs = this.checkRefsName(this.getClassHelper());
        return `${refs}.key`;
    }

    emitCreateClassDescription(module, description, name , flag){
        const refs = this.checkRefsName(this.getClassHelper());
        if( module && module.isFragment ){
            return `${refs}.creator(null,${name || module.id},${this.getDescription(description)}, ${!!flag});`;
        }else{
            return `${refs}.creator(${this.getIdByModule(module)},${name || module.id},${this.getDescription(description)}, ${!!flag});`;
        }
    }

    emitImportClass(module, name){
        const refs = this.checkRefsName(this.getClassHelper());
        return `var ${name || module.id} = ${refs}.require(${this.getIdByModule(module)});`;
    }

    emitPackImportClass(module, name){
        const refs = this.getPackModuleRefs();
        return `var ${name || module.id} = ${refs}.require(${this.getIdByModule(module)});`;
    }

    emitExportClass(module, name){
        if( module.isFragment ){
            return `return ${name || module.id};`;
        }
        const config = this.getConfig();
        const mod = config.module || 'commonjs';
        if( mod.toLowerCase() === 'es' ){
            return `export default ${name || module.id};`;
        }else{
            return `module.exports=${name || module.id};`;
        }
    }

    generatorVarName(stack,name,flag=false,callback=null){
        const dataset = this.createDataByStack(stack);
        if( dataset.hasOwnProperty(name) ){
            return dataset[name];
        }
        const value = stack.scope.generateVarName(name, flag);
        if(callback){
            callback(value,name);
        }
        return dataset[name] = value;
    }

    generatorRefName(target, name, key, callback, flag=false, eventType='insert'){
        const dataset = this.createDataByStack(target);
        if( dataset.hasOwnProperty(key) ){
            return dataset[key];
        }
        const fn = stack=>!!(stack.isBlockStatement || stack.isFunctionExpression);
        var block = fn(target) ? target : target.getParentStack(fn);
        const refName =  this.generatorVarName(target,name,flag);
        let content = callback ? `var ${refName} = ${callback()}` : `var ${refName}`;
        if(eventType==="insertBefore"){
            const num = block.async ? this.scope.asyncParentScopeOf.level+1 : null;
            content = this.semicolon( content, this.getIndent(num, block, !!block.async ) );
        }else{
            content = this.semicolon( content );
        }
        block.dispatcher(eventType,content);
        return dataset[key] = refName;
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

    isBlockStatement(){
        const stack = this.stack;
        return !!(stack.isFunctionExpression || 
                stack.isSwitchStatement      ||
                stack.isIfStatement         ||
                stack.isForInStatement      ||
                stack.isForStatement        ||
                stack.isForOfStatement      ||
                stack.isDoWhileStatement    ||
                stack.isBlockStatement      ||
                stack.isWhileStatement      ||
                stack.isTryStatement        ||
                stack.isPackageDeclaration  ||
                stack.isClassDeclaration    ||
                stack.isInterfaceDeclaration)         
    }

    isExpression(){
        const stack = this.stack;
        return stack.isVariableDeclaration || 
               stack.parentStack.isVariableDeclarator || 
               stack.parentStack.isExpressionStatement || 
               stack.isSwitchCase || 
               stack.isBreakStatement || 
               stack.isReturnStatement || 
               stack.isExpressionStatement;
    }

    getBlockStatement( stack ){
       stack = stack || this.stack.parentStack;
       while( stack && !(stack.isBlockStatement || stack.isSwitchStatement) ){
           stack=stack.parentStack;
       }
       if(stack && stack.isBlockStatement ){
           return stack.parentStack;
       }
       return stack;
    }

    inCaseStatement(stack){
        stack = stack || this.stack.parentStack;
        while( stack && !stack.isSwitchCase ){
            stack=stack.parentStack;
        }
        return !!(stack && stack.isSwitchCase);
    }

    getIndentNum( num=null, targetStack=null, isTop=false ){
        targetStack = targetStack || this.stack;
        let targetScope = targetStack.scope;
        let level = num === null ? targetScope.level : num;
        if( num === null ){
            const asyncIndent = !isTop && targetScope.asyncParentScopeOf ? 4 : 0;
            const pScope = targetScope.asyncParentScopeOf ? targetScope.getScopeByType("function") : null;
            if( pScope && targetScope.asyncParentScopeOf && pScope.hasChildAwait ){
                const asc = targetScope.asyncParentScopeOf;
                const stack = this.getBlockStatement(targetStack);
                level =  targetScope.parent && this.stack.isFunctionExpression ? targetScope.parent.level : asc.level+asyncIndent;
                if( stack ){
                    if(stack.isFunctionExpression && stack.scope !== asc ){
                        const diff = targetScope.level - stack.scope.parent.level;
                        level = asc.level+asyncIndent+diff;
                    }else{
                        let ps = targetScope;
                        while( ps && ps.parent && !(ps.parent === asc || ps === asc || ps.hasChildAwait) ){
                            ps = ps.parent;
                        }
                        let diff = targetScope.level - ps.level;
                        level = asc.level+asyncIndent+diff;
                    }
                }
                
            }else{
                if( targetScope.parent && targetStack.isFunctionExpression ) {
                    level = targetScope.parent.level;
                }else if( !targetStack.isBreakStatement && this.inCaseStatement(targetStack) ){
                    level+=1;
                }
                level+=asyncIndent;
            }
        }
        return level;
    }

    getIndent(num=null,stack=null, isTop=false){
        const level = this.getLevel( this.getIndentNum( num , stack, isTop) );
        return level > 0 ? "\t".repeat( level ) : '';
    }

    getLevel( level ){
        return level-1;
    }
    
    semicolon(expression,indent=null){
        if( !expression )return "";
        indent = indent === null ? this.getIndent() : indent;
        return `${indent}${expression};`;
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

    isDependModule(depModule,ctxModule){
        ctxModule = ctxModule || this.module;
        if( this.compilation.isPolicy(2,depModule) ){
            return false;
        }
        const isUsed = this.isUsed(depModule);
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

    isActiveForModule( depModule, ctxModule ){
        return this.isDependModule( depModule, ctxModule );
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

    createDependencies(module, refs){
        const config = this.getConfig();
        const push = (value)=>{
            if( refs.indexOf(value) < 0 ){
                refs.push( value );
            }
        }
        this.createModuleAssets( module, refs );
        this.createModuleRequires( module, refs );
        this.getDependencies(module).forEach( depModule=>{
            const alias = module.importAlias.get( depModule );
            if( this.isDependModule(depModule) ){
                const name = this.getModuleReferenceName(depModule, module);
                if( config.useAbsolutePathImport ){
                    const file = this.getModuleFile(depModule);
                    push( this.createImport(alias || name, file.replace(/\\/g,'/') ) );
                }else{
                    push( this.createImport(alias || name, this.getOutputRelativePath(depModule,module) ) );
                }
            }else if( this.isUsed(depModule) ){
                this.createModuleAssets( depModule, refs, alias , module);
                this.createModuleRequires( depModule, refs, alias , module);
            }
        });
    }

    createImport(name, file){
        const config = this.getConfig();
        const mod = config.module || 'commonjs';
        if( mod.toLowerCase() === 'es' ){
            if( name ){
                return `import ${name} from "${file}";`
            }else{
                return `import "${file}";`
            }
        }else{
            if( name ){
                const [from,to] = name.split(/\s+as\s+/i);
                if( to ){
                    return `var ${to} = require("${file}").${from};`
                }else{
                    return `var ${name} = require("${file}");`
                }
            }else{
                return `require("${file}");`
            }
        } 
    }

    definePropertyDescription(target,name,value,isAccessor,modifier,id,compute, configurable, writable, required){
        const map={
            "public":Constant.MODIFIER_PUBLIC,
            "protected":Constant.MODIFIER_PROTECTED,
            "private":Constant.MODIFIER_PRIVATE,
        }
        const items = [`m:${map[modifier]},d:${id}`]
        if( configurable ){
            items.push( `configurable:true` );
        }
        if( id === Constant.DECLARE_PROPERTY_VAR || writable ){
            items.push(`writable:true`);
        }
        if( (isAccessor || id === Constant.DECLARE_PROPERTY_VAR || id === Constant.DECLARE_PROPERTY_CONST) && modifier==="public"){
            items.push(`enumerable:true`);
        }
        if( required ){
            items.push(`required:true`);
        }
        if( isAccessor ){
            if( value.get ){
                items.push(`get:`+value.get);
            }
            if( value.set ){
                items.push(`set:`+value.set);
            }
        }else{
            items.push(`value:`+value);
        }
        if( compute ){
            return `${target}[${name}]={${items.join(",")}};`
        }
        return `${target}.${name}={${items.join(",")}};`
    }

    getDescription(description){
       if( description.length >0 ){
           return `{\r\n\t${description.join(",\r\n\t")}\r\n}`;
       }
       return `{}`;
    }

    getImps(module){
        return module.implements.filter( module=>{
            const result = !module.isDeclaratorModule && module.isInterface;
            if( result ){
                this.addDepend( module )
                return true;
            }
        });
    }

    getInherit(module){
        const inherit = module && module.inherit;
        if( inherit ){
            if( !this.isDependModule(inherit,module) ){
                return null;
            }
            this.addDepend( inherit );
        }
        return inherit;
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

    emitCreateElement(){
        return this.semicolon(`var ${this.getJsxCreateElementHandle()} = ${this.getJsxCreateElementRefs()}`)
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

    factory(syntaxClass,stack){
        const obj = new syntaxClass( stack );
        obj.name = this.name
        obj.platform = this.platform;
        return obj;
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