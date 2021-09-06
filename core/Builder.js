const fs = require("fs");
const path = require("path");
const Syntax = require("./Syntax");
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
        const builder = ( module )=>{
            if( !buildModules.has(module) && this.isNeedBuild(module) ){
                buildModules.add(module);
                if( !module.compilation.completed(this.name) ){
                    const file = this.getModuleFile(module);
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        filesystem.mkdirpSync( path.dirname(file) );
                        filesystem.writeFileSync(file, this.make(stack) );
                        if( config.emitFile ){
                            this.emitFile( this.getOutputAbsolutePath(module), filesystem.readFileSync(file) );
                        } 
                    }else{
                        done( new Error(`Not found stack by '${module.getName()}'`) );
                    }
                    buildedCompilations.add( module.compilation );
                }
            }
        };

        const builderAll=(module)=>{
            if( !buildModules.has(module) ){
                builder(module);
                this.getDependencies(module).forEach( depModule=>{
                    builderAll(depModule);
                });
            }
        }

        compilation.completed(this.name,false);
        compilation.modules.forEach( module =>builderAll(module) )

        if( config.pack ){
            const System = compilation.getModuleById("System");
            const outputPath= path.resolve(config.output || options.output, config.name);
            const contents=[];
            const added = new Set();
            const cached = new Set();
            const push = (module)=>{
                if( !added.has(module) ){
                    added.add( module );
                    const value = filesystem.readFileSync( this.getModuleFile(module) );
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

        buildedCompilations.forEach(compilation=>{
            compilation.completed(this.name,true);
        });
        compilation.completed(this.name,true);

        done();
    }

    build(done){
        const compilation = this.compilation;
        const compiler    = this.compiler;
        compilation.completed(this.name,false);
        try{
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