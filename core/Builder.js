const fs = require("fs");
const path = require("path");
const Syntax = require("./Syntax");
const Polyfill = require("./Polyfill");
class Builder extends Syntax{

    start( done ){
        try{
            const compilation = this.compilation;
            const compiler    = this.compiler;
            const buildModules = new Set();
            const beforeContent = [];
            const filesystem  = compiler.getOutputFileSystem( this.name );
            const options     = this.getOptions();
            const config      = this.getConfig();
            const builder = ( module )=>{
                if( this.isNeedBuild(module) && !module.compilation.completed(this.name) ){
                    const file = this.getModuleFile(module);
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        filesystem.mkdirpSync( path.dirname(file) );
                        filesystem.writeFileSync(file, this.make(stack) );
                        if( config.emitFile ){
                            this.emitFile( this.getOutputAbsolutePath(module), filesystem.readFileSync(file) );
                        } 
                    }else{
                        throw new Error(`Not found stack by '${module.getName()}'`);
                    }
                }
            };

            const builderAll=(module)=>{
                if( !buildModules.has(module) ){
                    buildModules.add(module);
                    builder(module);
                    this.getDependencies(module).forEach( depModule=>{
                        builderAll(depModule);
                    });
                }
            }

            compilation.completed(this.name,false);
            compilation.modules.forEach( module =>builderAll(module) );
            this.createCore();
            if( config.pack ){
                const outputPath= path.resolve(config.output || options.output, config.name);
                const modules = new Map();
                const added = new Set();
                const push = (module)=>{
                    const value = filesystem.readFileSync( this.getModuleFile(module) );
                    if( value ){
                        const comment = `/*class  ${module.getName()}*/\r\n`; 
                        modules.set(this.getIdByModule(module), `${comment}function(module,export,require){\r\n${value.replace(/\r\n/g,'\r\n\t')}\r\n}`);
                    }
                }
                const every=(module)=>{
                    if( !added.has(module) )return;
                    added.add( module );
                    if( this.isNeedBuild(module) && this.isUsed(module) ){
                        push( module );
                        this.getDependencies(module).forEach( depModule=>{
                            every(depModule);
                        });
                    }
                }
                compilation.modules.forEach( module =>every(module) );
                if(config.strict){
                    beforeContent.push(`"use strict";`)
                }

                const contents= this.bootstrap(this.getIdByModule( compilation.modules.values()[1]), '{'+Array.from(modules.values()).join(',')+'}');
                this.emitFile(outputPath, beforeContent.concat( contents ).join("\r\n") );
            }
            buildModules.forEach(module=>{
                module.compilation.completed(this.name,true);
            });
            compilation.completed(this.name,true);
            done();
        }catch(e){
            done(e);
        }
    }

    build(done){
        const compilation = this.compilation;
        const compiler    = this.compiler;
        compilation.completed(this.name,false);
        try{
            this.createCore();
            compilation.modules.forEach( module =>{
                if( this.isNeedBuild(module) ){
                    const stack = compilation.getStackByModule(module);
                    if( stack ){
                        const filesystem  = compiler.getOutputFileSystem( this.name );
                        const file = this.getModuleFile(module);
                        filesystem.mkdirpSync( path.dirname(file) );
                        filesystem.writeFileSync(file, this.make(stack) );
                        const config = this.getConfig();
                        if( config.emitFile ){
                            this.emitFile( this.getOutputAbsolutePath(module), filesystem.readFileSync(file) );
                        } 
                    }else{
                        throw new Error(`Not found stack by '${module.getName()}'`);
                    }
                }
            });
            compilation.completed(this.name,true);
            done();
        }catch(e){
            done(e);
        }
    }

    createCore(){
        const filesystem  = this.compiler.getOutputFileSystem( this.name );
        const coreModule = Polyfill.modules.get('ClassFactor');
        const coreFile = this.getModuleFile( coreModule );
        const config = this.getConfig();
        if( !filesystem.existsSync( coreFile ) ){
            filesystem.mkdirpSync( path.dirname(coreFile) );
            filesystem.writeFileSync(coreFile, this.loadCore() );
            if( config.emitFile ){
                this.emitFile( this.getOutputAbsolutePath( coreModule ), filesystem.readFileSync(file) );
            }
        }
    }

    isNeedBuild(module){
        if(!module)return false;
        if( module.compilation.isPolicy(2,module) ){
            return false;
        }
        const isDeclaratorModule = module.isDeclaratorModule;
        const isPolyfill = isDeclaratorModule && Polyfill.modules.has( module.id );
        return !isDeclaratorModule || isPolyfill;
    }

    bootstrap(mainId, modules){
        const bootstrap = fs.readFileSync( path.join(__dirname,"../bootstrap.js") ).toString();
        return bootstrap.replace(/\[CODE\[([A-Z|_]+?)\]\]/g,function(a,name){
                switch(name){
                    case "MAIN_IDENTIFIER" :
                        return mainId;
                    case "MODULES":
                        return modules;
                }
                return 'null';
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
}

module.exports = Builder;