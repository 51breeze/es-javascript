const fs = require("fs");
const path = require("path");
const Generator = require("./Generator");
const Syntax = require("./Syntax");
const Token = require("./Token");
class Builder extends Syntax{

    emitContent(filesystem, module, content, file, emitFile, flag){
        if( content ){
            filesystem.mkdirpSync( path.dirname(file) );
            filesystem.writeFileSync(file, content );
            if( emitFile ){
                this.emitFile( this.getOutputAbsolutePath(module, flag), filesystem.readFileSync(file) );
            } 
        }
    }

    emitAssets(filesystem,module,emitFile){
        if( !module )return;
        var assets = module.assets;
        const compilation = module.compilation;
        if( compilation.assets.size > 0 ){
            assets = Array.from( assets.values() );
            assets = assets.concat( Array.from( compilation.assets.values() ) );
        }
        assets.forEach( asset=>{
            if( !asset.file && asset.type ==="style" ){
                const file = this.getModuleFile( module, asset.id, asset.type, asset.resolve);
                this.emitContent(filesystem, module, asset.content, file);
            }else if( asset.file && asset.resolve ){
                if( fs.existsSync(asset.resolve) ){
                    const content = fs.readFileSync( asset.resolve );
                    this.emitContent(filesystem, module, content, asset.resolve);
                    if( emitFile ){
                        this.emitFile( this.getOutputAbsolutePath(asset.resolve, true), content );
                    }
                }else{
                    console.warn( `Assets file the '${asset.file}' is not emit.`);
                }
            }else{
                console.warn( `Assets file the '${asset.file}' is not emit.`);
            }
        });
    }

    start( done ){
        try{
            const compilation = this.compilation;
            const compiler    = this.compiler;
            const buildModules = new Set();
            const filesystem  = compiler.getOutputFileSystem( this.name );
            const config      = this.getConfig();
            const builder = ( module )=>{
                if( this.isNeedBuild(module) && !module.compilation.completed(this.name) ){
                    const stack = compilation.getStackByModule(module);
                    if(stack){
                        const file = this.getModuleFile(module);
                        const content = this.make(stack);

                        if( content ){
                           const gen = new Generator(module, compilation);
                           gen.make( content )
                           console.log( gen.toString() )
                        }


                        //this.emitContent(filesystem, module, content, file, config.emitFile);
                        //this.emitAssets(filesystem,module,config.emitFile);
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
            if( compilation.modules.size >0 ){
                compilation.modules.forEach( module =>builderAll(module) );
            }else{
                this.emitContent(filesystem, compilation.file, this.make(compilation.stack), compilation.file, config.emitFile, true);
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

    createNodes(){
        const compilation = this.compilation;
        const compiler    = this.compiler;

        const token = new Token( compilation.stack.toString() );
        token.compilation = this.compilation;
        token.compiler = this.compiler;
        token.stack = compilation.stack;
        token.scope = compilation.stack.scope;
        token.builder = this;
        token.platform = this.platform;
        token.plugin = this.plugin;
        token.name = this.name;

        const top = token.createToken( compilation.stack );

       
        
        
    }

    build(done){
        const compilation = this.compilation;
        const compiler    = this.compiler;
        const config      = this.getConfig();
        const filesystem  = compiler.getOutputFileSystem( this.name );
        if( compilation.completed(this.name) ){
            return done();
        }
        try{
            compilation.completed(this.name,false);
            // if( compilation.modules.size >0 ){
            //     compilation.modules.forEach( module =>{
            //         if( this.isNeedBuild(module) ){
            //             const stack = compilation.getStackByModule(module);
            //             if( stack ){
            //                 const content = this.make(stack);
            //                 const file    = this.getModuleFile(module);
            //                 this.emitContent(filesystem, module, content, file, config.emitFile);
            //                 this.emitAssets(filesystem,module,config.emitFile);
            //             }else{
            //                 throw new Error(`Not found stack by '${module.getName()}'`);
            //             }
            //         }
            //     });
            // }else{
            //     this.emitContent(filesystem, compilation, this.make(compilation.stack), compilation.file, config.emitFile, true); 
            // }

           
            
            compilation.completed(this.name,true);
            done();
        }catch(e){
            done(e);
        }
    }

    isNeedBuild(module){
        if(!module)return false;
        if( module.compilation.isPolicy(2,module) ){
            return false;
        }
        return true;
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