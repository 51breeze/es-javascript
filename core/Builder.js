const fs = require("fs");
const path = require("path");
const Syntax = require("./Syntax");
const Constant = require("./Constant");
const Polyfill = require("./Polyfill");
class Builder extends Syntax{

    start( done ){
        const compilation = this.compilation;
        const compiler    = this.compiler;
        const buildModules = new Set();
        const buildedCompilations = new Set();
        const beforeContent = [];
        const filesystem  = compiler.getOutputFileSystem( this.name );
        const options     = this.getOptions();
        const config      = this.getConfig();
        const getModuleFile = (module)=>{
           return module.compilation.modules.size > 1 ? `${module.file}?id=${module.id}` : module.file;
        }
        
        const builder = ( module )=>{
            if( !buildModules.has(module) && this.isNeedBuild(module) ){
                buildModules.add(module);
                if( !module.compilation.completed(this.name) ){
                    const file = getModuleFile(module);
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        filesystem.mkdirpSync( path.dirname(file) );
                        filesystem.writeFileSync(file, this.make(stack) );
                    }else{
                        done( new Error(`Not found stack by '${module.getName()}'`) );
                    }
                    if( config.output.mode === Constant.BUILD_OUTPUT_EVERY_FILE ){
                        this.emitFile( this.getOutputAbsolutePath(module), filesystem.readFileSync(file) );
                    } 
                    buildedCompilations.add( module.compilation );
                }
            }
        };
        compilation.completed(this.name,false);
        if( config.build === Constant.BUILD_ALL_FILE ){
            const builderAll=(module)=>{
                if( !buildModules.has(module) ){
                    builder(module);
                    this.getDependencies(module).forEach( depModule=>{
                        builderAll(depModule);
                    });
                }
            }
            compilation.modules.forEach( module =>builderAll(module) )
        }else if(config.build === Constant.BUILD_ORIGIN_FILE){
            compilation.modules.forEach( module =>{
                builder(module);
            });
        }

        if( config.output.mode === Constant.BUILD_OUTPUT_MERGE_FILE ){
            const System = compilation.getModuleById("System");
            const outputPath= path.resolve(options.output, config.output.name);
            const contents=[];
            const added = new Set();
            const cached = new Set();
            const push = (module)=>{
                if( !added.has(module) ){
                    added.add( module );
                    const value = filesystem.readFileSync( getModuleFile(module) );
                    if( value ){
                        contents.push( value );
                    }
                }
            }  
            const every=(module)=>{
                if( cached.has(module) )return;
                cached.add( module );
                if( this.isNeedBuild(module) && this.isUsed(module) ){
                    this.getDependencies(module).forEach( depModule=>{
                        every(depModule);
                    });
                    push( module );
                }
            }

            push(System);
            compilation.modules.forEach( module =>every(module) );

            if(config.strict){
                beforeContent.push(`"use strict";`)
            }
            
            this.emitFile(outputPath, beforeContent.concat( contents ).join("\r\n") );
        }
        compilation.completed(this.name,true);
        done();
    }

    build(done){
        const compilation = this.compilation;
        compilation.completed(this.name,false);
        try{
            compilation.modules.forEach( module =>{
                if( this.isNeedBuild(module) ){
                    const stack = compilation.getStackByModule(module);
                    if( stack ){
                        const file = this.getOutputAbsolutePath(module);
                        this.emitFile(file, this.make(stack) );
                    }else{
                        done( new Error(`Not found stack by '${module.getName()}'`) );
                    }
                }
            });
        }catch(e){
            done(e);
        }
        compilation.completed(this.name,true);
        done();
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
                 console.log( name )
                switch(name){
                    case "MAIN_IDENTIFIER" :
                        return mainId;
                    case "MODULES":
                        return modules;
                }
                return '';
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