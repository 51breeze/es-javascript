const fs = require("fs");
const path = require("path");
const Syntax = require("./Syntax");
const Constant = require("./Constant");
const Polyfill = require("./Polyfill");
class Builder extends Syntax{

    buildExternal( externals ){
        if( externals && externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${externals.map( item=>item.emiter( this ) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }
    
    start( done ){

        const syntax = this;
        const compilation = this.compilation;
        const compiler    = this.compiler;
        const buildModules = new Set();
        const beforeContent = [];
        const filesystem  = compiler.getOutputFileSystem( this.name );
        const options     = this.getOptions();
        const config      = this.getConfig();
        const getModuleFile = (module)=>{
           return module.compilation.modules.size > 1 ? `${module.file}?id=${module.id}` : module.file;
        }

        const builder = ( module )=>{
            if( !(module.completed || module.building) ){
                module.building = true;
                const isDeclaratorModule = module.isDeclaratorModule;
                const isPolyfill = isDeclaratorModule && Polyfill.modules.has( module.id );
                if( !isDeclaratorModule || isPolyfill ){
                    buildModules.add( module );
                    const file = getModuleFile(module);
                    const stack = compilation.getStackByModule(module);
                    filesystem.mkdirpSync( path.dirname(file) );
                    const writeStream = filesystem.createWriteStream(file, {flag:'a+'})
                    writeStream.write( stack.emiter( syntax ) );
                    const externals = this.buildExternal( module.compilation.stack.externals, syntax);
                    if( externals ){
                        writeStream.write( '\r\n' );
                        writeStream.write( externals );
                    }
                    if( config.output.mode === Constant.BUILD_OUTPUT_EVERY_FILE ){
                        this.emitFile( this.getOutputAbsolutePath(module), filesystem.readFileSync(file) );
                    }
                }
                module.completed = true;
                module.building = false;
            }
        };

        const System = compilation.getModuleById("System");
        builder( System );
       
        if( config.build === Constant.BUILD_ALL_FILE ){
            const builderAll=(module)=>{
                if( !(module.completed || module.building) ){
                    builder(module);
                    module.dependencies.forEach( depModule=>{
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

            const buildAllModules = Array.from( buildModules.values() ).sort( (a,b)=>{
                const aId = this.getIdByModule(a);
                const bId = this.getIdByModule(b);
                return aId < bId ? -1 : 0;
            });

            const contentModules = buildAllModules.map( module=>filesystem.readFileSync( getModuleFile(module) ) );
            const outputPath   = path.resolve(options.output, config.output.name);

            if(config.strict){
                beforeContent.push(`"use strict";`)
            }
            beforeContent.push( this.bootstrap(1, `[${contentModules.join("\r\n,")}]`) );

            this.emitFile(outputPath, beforeContent.join("\r\n") );

        }

        done();
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
        fs.writeFileSync(file, content);
    }
}

module.exports = Builder;