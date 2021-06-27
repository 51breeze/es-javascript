const Syntax = require("../core/Syntax");
const Filesystem = require("../../core/Filesystem");
const Constant = require("../../core/Constant");
class BuildEmiter extends Syntax{

    builderExternal(externals, syntax){
        if( externals && externals.length > 0 ){
            return `/*externals code*/\r\n(function(){\r\n\t${externals.map( item=>item.emiter(syntax) ).join("\r\n\t")}\r\n}());`;
        }
        return null;
    }
    
    emiter(syntax){
        const compilation = this.compilation;
        const compiler    = compilation.compiler;
        const beforeContent = [];
        const filesystem  = compiler.getFilesystem( this.syntaxName );
        const options  = compiler.options;
        const config = this.getConfig();
        const polyfill = Syntax.target.modules.Polyfill;
        const builder = ( module )=>{
            if( !(module.completed || module.building) ){
                module.building = true;
                const isDeclaratorModule = module.isDeclaratorModule;
                const isPolyfill = isDeclaratorModule && polyfill.modules.has( module.id );
                if( !isDeclaratorModule || isPolyfill ){
                    const file = module.compilation.modules.size > 1 ? `${module.file}?id=${module.id}` : module.file;
                    const childFilesystem = filesystem.createFile(file);
                    const stack = compilation.getStackByModule(module);
                    childFilesystem.write( stack.emiter( syntax ) );
                    const externals = this.builderExternal( module.compilation.stack.externals, syntax);
                    if( externals ){
                        childFilesystem.write( '\r\n' );
                        childFilesystem.write( externals );
                    }
                    if( config.output.mode === Constant.BUILD_OUTPUT_EVERY_FILE ){
                        childFilesystem.persistent( this.getOutputAbsolutePath(module) );
                    }
                }
                module.completed = true;
                module.building = false;
            }
        };

        if(config.strict){
            beforeContent.push(`"use strict";`)
        }

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
            compilation.modules.forEach( module =>builder(module) )
        }

        if( config.output.mode === Constant.BUILD_OUTPUT_MERGE_FILE ){

            const buildAllFiles = new Set();
            const hash    = new Map();
            const System = compilation.getModuleById("System");
            const dependency = (module)=>{
                if( !hash.has(module) ){
                    hash.set(module,true);
                    module.dependencies.forEach( depModule=>{
                        dependency( depModule )
                    });
                    const childFilesystem = filesystem.children.get(module.file);
                    if( childFilesystem ){
                        buildAllFiles.add( childFilesystem );
                    }
                }
            }

            builder( System );
            if( filesystem.children.has(System.file) ){
                buildAllFiles.add( filesystem.children.get(System.file) );
            }
            
            compiler.compilations.forEach( compilation=>{
                if( compilation.isGlobalType){
                    compilation.modules.forEach(module=>{
                        const isPolyfill = module.isDeclaratorModule && polyfill.modules.has( module.id );
                        if( isPolyfill ){
                            const childFilesystem = filesystem.children.get(module.file);
                            if( childFilesystem ){
                                buildAllFiles.add( childFilesystem );
                            }
                        }
                    });
                }
            });

            compilation.modules.forEach( module=>dependency(module) );

            const buildFiles = Array.from( buildAllFiles.values() );
            const event={
                name:config.output.name,
                path:options.output,
                buildFiles,
                syntax:this.syntaxName
            };
            compiler.dispatcher("fetchBuildFilePathEmit",event);
            if( event.path ){
                filesystem.persistent( 
                    Filesystem.getResolve(event.path, event.name), 
                    beforeContent.concat( buildFiles.map( item=>item.toString() ) ).join("\r\n")
                );
            }
        }
    }
}

module.exports = BuildEmiter;