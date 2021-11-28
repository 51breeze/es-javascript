const Constant = require("./Constant");
const Polyfill = require("./Polyfill");
const PATH = require("path");
const events = require('events');
const moduleIdMap=new Map();
const namespaceMap=new Map();
const createdStackData = new Map();
class Syntax extends events.EventEmitter {

    constructor(stack){
        super();
        this.stack = stack;
        this.parentStack = stack.parentStack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.compiler = stack.compiler;
        this.module = stack.module; 
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
        if( this.scope.isDefine(name) ){
            const topStack = this.stack.getParentStack((stack)=>!!stack.isClassDeclaration);
            var classScope = this.scope.getScopeByType("class");
            var value = this.generatorVarName(topStack,name);
            classScope.dispatcher("insertTopRefsToClassBefore",{name,value});
            return value;
        }
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

    emitCreateClassDescription(module, description, name){
        const refs = this.checkRefsName(this.getClassHelper());
        if( module && module.isFragment ){
            return `${refs}.creator(null,${name || module.id},${this.getDescription(description)});`;
        }else{
            return `${refs}.creator(${this.getIdByModule(module)},${name || module.id},${this.getDescription(description)});`;
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
        if( config.pack ){
            return `${this.getPackModuleRefs()}.exports=${name || module.id};`;
        }
        const mod = config.module || 'commonjs';
        if( mod.toLowerCase() === 'es' ){
            return `export default ${name || module.id};`;
        }else{
            return `module.exports=${name || module.id};`;
        }
    }

    generatorVarName(stack,name,flag=false){
        const dataset = this.createDataByStack(stack);
        if( dataset.hasOwnProperty(name) ){
            return dataset[name];
        }
        const value = stack.scope.generateVarName( name , flag);
        return dataset[name] = value;
    }

    generatorRefName(target, name, key, callback){
        const dataset = this.createDataByStack(stack);
        if( dataset.hasOwnProperty(key) ){
            return dataset[key];
        }
        const block = target.getParentStack( stack=>!!stack.isBlockStatement );
        const refName =  this.generatorVarName(target,name);
        block.dispatcher("insert",this.semicolon(`var ${refName} = ${callback()}`));
        return dataset[key] = refName;
    }

    getOutputAbsolutePath(module){
        const options = this.getOptions();
        const config = this.getConfig();
        const suffix = config.suffix||".js";
        const workspace = config.workspace || this.compiler.workspace;
        const output = config.output || options.output;
        if( module.isDeclaratorModule ){
            const polyfillModule = Polyfill.modules.get( module.id );
            const filename = module.id+suffix;
            if( polyfillModule ){
                return PATH.join(output,(polyfillModule.namespace||'').replace(/\./g,'/'),filename).replace(/\\/g,'/');
            }
            return PATH.join(output,module.getName("/")+suffix).replace(/\\/g,'/');
        }
        const filepath = PATH.resolve(output, PATH.relative( workspace, module.file ) );
        const info = PATH.parse(filepath);
        if( info.ext !== suffix ){
           return PATH.join(info.dir,info.name+suffix).replace(/\\/g,'/');
        }
        return filepath.replace(/\\/g,'/');
    }

    getOutputRelativePath(module,context){
        const contextPath = this.getOutputAbsolutePath(context);
        const modulePath  = this.getOutputAbsolutePath(module);
        return './'+PATH.relative( PATH.dirname(contextPath), modulePath ).replace(/\\/g,'/');
    }

    getOptions(){
        return this.compiler.options || {};
    }
    
    getConfig( name ){
        const config = this.configuration || {};
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

    inCaseStatement(){
        let stack = this.stack.parentStack;
        while( stack && !stack.isSwitchCase ){
            stack=stack.parentStack;
        }
        return !!(stack && stack.isSwitchCase);
    }

    getIndentNum( num=null ){
        let level = num === null ? this.scope.level : num;
        if( num === null ){
            const asyncIndent = this.scope.asyncParentScopeOf ? 4 : 0;
            const pScope = this.scope.asyncParentScopeOf ? this.scope.getScopeByType("function") : null;
            if( pScope && this.scope.asyncParentScopeOf && pScope.hasChildAwait ){
                const asc = this.scope.asyncParentScopeOf;
                const stack = this.getBlockStatement();
                level =  this.scope.parent && this.stack.isFunctionExpression ? this.scope.parent.level : asc.level+asyncIndent;
                if( stack ){
                    if(stack.isFunctionExpression && stack.scope !== asc ){
                        const diff = this.scope.level - stack.scope.parent.level;
                        level = asc.level+asyncIndent+diff;
                    }else{
                        let ps = this.scope;
                        while( ps && ps.parent && !(ps.parent === asc || ps === asc || ps.hasChildAwait) ){
                            ps = ps.parent;
                        }
                        let diff = this.scope.level - ps.level;
                        level = asc.level+asyncIndent+diff;
                    }
                }
                
            }else{
                if( this.scope.parent && this.stack.isFunctionExpression ) {
                    level = this.scope.parent.level;
                }else if( !this.stack.isBreakStatement && this.inCaseStatement() ){
                    level+=1;
                }
                level+=asyncIndent;
            }
        }
        return level;
    }

    getIndent(num=null){
        const level = this.getLevel( this.getIndentNum( num ) );
        return level > 0 ? "\t".repeat( level ) : '';
    }

    getLevel( level ){
        return level-1;
    }
    
    semicolon(expression){
        if( !expression )return "";
        return `${this.getIndent()}${expression};`;
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

    addDepend( depModule ){
        const module = this.module;
        if( !depModule.isModule || depModule === module )return;
        this.compilation.addDependency(depModule,module);
    }

    getDependencies( module ){
        return this.compilation.getDependencies(module) || [];
    }

    isDependModule(depModule){
        if( this.compilation.isPolicy(2,depModule) ){
            return false;
        }
        const isUsed = this.isUsed(depModule);
        const isRequire = !depModule.isDeclaratorModule && 
                            isUsed &&
                            this.compiler.callUtils("isLocalModule", depModule) && 
                            !this.compiler.callUtils("checkDepend",module, depModule);         
        const isPolyfill = depModule.isDeclaratorModule && Polyfill.modules.has(depModule.id);
        if( isRequire || isPolyfill){
            return true;
        }
        return isUsed && depModule.require;
    }

    getModuleFile(module){
        if(module.require){
            return module.file;
        }
        return module.compilation.modules.size > 1 ? `${module.file}?id=${module.id}` : module.file;
    }

    getModuleReferenceName(module,context){
        context = context || this.module;
        if( module.require ){
            return module.id;
        }
        if( context ){
            return context.getReferenceNameByModule( module );
        }
        return module.namespace.getChain().concat(module.id).join("_");
    }

    createDependencies(module, refs){
        const config = this.getConfig();
        const push = (value)=>{
            if( refs.indexOf(value) < 0 ){
                refs.push( value );
            }
        }
        this.getDependencies(module).forEach( depModule=>{
            if( this.isDependModule(depModule) ){
                const name = this.getModuleReferenceName(depModule, module);
                if( config.pack ){
                    push( this.emitPackImportClass(depModule, name) );
                }else if( depModule.require ){
                    push( this.createImport(name, depModule.require ) );
                }else if( config.useAbsolutePathImport ){
                    const file = this.getModuleFile(depModule);
                    push( this.createImport(name, file.replace(/\\/g,'/') ) );
                }else{
                    push( this.createImport(name, this.getOutputRelativePath(depModule,module) ) );
                }
            }
        });
    }

    getCoreFileOutputPath( file, context ){
        const config = this.getConfig();
        const options = this.getOptions();
        const output = config.output || options.output;
        const filename = PATH.join(output,(config.ns||'').replace(/\./g,'/'),PATH.basename(file)).replace(/\\/g,'/');
        if( config.useAbsolutePathImport ){
            return filename;
        }else{
            return './'+PATH.relative(PATH.dirname(this.getOutputAbsolutePath(context)),filename).replace(/\\/g,'/');
        }
    }

    createImport(name, file){
        const config = this.getConfig();
        const mod = config.module || 'commonjs';
        if( mod.toLowerCase() === 'es' ){
            return `import ${name} from "${file}";`
        }else{
            return `var ${name} = require("${file}");`
        } 
    }

    definePropertyDescription(target,name,value,isAccessor,modifier,id,compute, configurable){
        const map={
            "public":Constant.MODIFIER_PUBLIC,
            "protected":Constant.MODIFIER_PROTECTED,
            "private":Constant.MODIFIER_PRIVATE,
        }
        const items = [`m:${map[modifier]},d:${id}`]
        if( configurable ){
            items.push( `configurable:true` );
        }
        if( id === Constant.DECLARE_PROPERTY_VAR ){
            items.push(`writable:true`);
        }
        if( (isAccessor || id === Constant.DECLARE_PROPERTY_VAR || id === Constant.DECLARE_PROPERTY_CONST) && modifier==="public"){
            items.push(`enumerable:true`);
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
        const inherit = module.extends.filter( module=>module.isClass );
        if( inherit[0] ){
            this.addDepend( inherit[0] );
        }
        return inherit[0] || null;
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

    emitVueCreateClass(module, inherit, props, data){
        const refs = module.getReferenceNameByModule(inherit);
        const handle = `${refs}.makeComponent`;
        const properties = [];
        const indent = this.getIndent();
        if( props.length > 0 ){
            properties.push( `props:{\r\n\t\t${indent}${props.join(`,\r\n\t\t${indent}`)}\r\n\t${indent}}` );
        }
        if( data.length > 0 ){
            properties.push( `data:{\r\n\t\t${indent}${data.join(`,\r\n\t\t${indent}`)}\r\n\t${indent}}` );
        }
        return this.semicolon(`${handle}('${module.id}', ${module.id}, {\r\n\t${indent}${properties.join(`,\r\n\t${indent}`)}\r\n})`);
    }

    getJsxCreateElementHandle(){
        return 'createElement';
    }
    
    getJsxCreateComponentHandle(){
        return 'createComponent';
    }

    isInheritWebComponent(classModule){
        while( classModule=classModule.inherit ){
            const stack = this.compilation.getStackByModule( classModule );
            if( stack ){
                if( stack.annotations.some( item=>item.name.toLowerCase() === 'webcomponent' ) ){
                    return true;
                }
            }
        }
        return false;
    }

    emitter(){}

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