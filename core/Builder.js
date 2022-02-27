const fs = require("fs");
const path = require("path");
const Syntax = require("./Syntax");
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

    emitStyleAssets(filesystem,module){
        module && module.assets.forEach( asset=>{
            if( !asset.file && asset.type ==="style" ){
                const file = this.getModuleFile( module, asset.resolve, asset.type);
                this.emitContent(filesystem, module, asset.content, file);
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
                        this.emitContent(filesystem, module, content, file, config.emitFile);
                        this.emitStyleAssets(filesystem,module);
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
            if( config.pack ){
                this.doPack();
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
        const config      = this.getConfig();
        const filesystem  = compiler.getOutputFileSystem( this.name );
        compilation.completed(this.name,false);
        try{
            if( compilation.modules.size >0 ){
                compilation.modules.forEach( module =>{
                    if( this.isNeedBuild(module) ){
                        const stack = compilation.getStackByModule(module);
                        if( stack ){
                            const content = this.make(stack);
                            const file    = this.getModuleFile(module);
                            this.emitContent(filesystem, module, content, file, config.emitFile);
                            this.emitStyleAssets(filesystem,module);
                        }else{
                            throw new Error(`Not found stack by '${module.getName()}'`);
                        }
                    }
                });
            }else{
                this.emitContent(filesystem, compilation.file, this.make(compilation.stack), compilation.file, config.emitFile, true); 
            }
            compilation.completed(this.name,true);
            done();
        }catch(e){
            console.log(e)
            done(e);
        }
    }

    doPack(){
        const compilation = this.compilation;
        const compiler    = this.compiler;
        const config = this.getConfig();
        const options = this.getOptions();
        const outputPath= path.resolve(config.output || options.output, config.name);
        const content = [];
        const added = new Set();
        const filesystem  = compiler.getOutputFileSystem( this.name );
        const push = (module)=>{
            const file = this.getModuleFile(module);
            if( filesystem.existsSync( file ) ){
                const value = filesystem.readFileSync( file );
                if( value ){
                    const id = this.getIdByModule(module);
                    const identifier = module.isInterface ? 'Interface' : module.isEnum ? 'Enum' : 'Class';
                    const comment = `/*\r\n${identifier} ${module.getName()}\r\n*/\r\n`; 
                    const code = `${comment}function(${this.getPackModuleRefs()},exports){\r\n\t${value.toString().replace(/\r\n/g,'\r\n\t')}\r\n}`;
                    content.push({id,code});
                }
            }
        }
        const every=(module)=>{
            if( added.has(module) )return;
            added.add( module );
            if( this.isNeedBuild(module) && this.isUsed(module) ){
                this.getDependencies(module).forEach( depModule=>{
                    every(depModule);
                });
                push( module );
            }
        }

        const main = [];
        compilation.modules.forEach( module =>{
            main.push( module );
            every(module)
        });

        content.sort((a,b)=>{
            return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
        });

        const bootstrap= this.bootstrap( main, `{\r\n${content.map(item=>`${item.id}:${item.code}`).join(',\r\n')}\r\n}`);
        if(config.strict){
            this.emitFile(outputPath, `"use strict";\r\n${bootstrap}`);
        }else{
            this.emitFile(outputPath, bootstrap);
        }
    }

    isNeedBuild(module){
        if(!module)return false;
        if( module.compilation.isPolicy(2,module) ){
            return false;
        }
        return true;
    }

    bootstrap(entrances, modules){
        const bootstrap = fs.readFileSync( path.join(__dirname,"../bootstrap.js") ).toString();
        return bootstrap.replace(/\[CODE\[([A-Z|_]+?)\]\]/g,(a,name)=>{
                switch(name){
                    case "MAIN_ENTER" :
                        return entrances.map( module=>{
                            return `/*enter class ${module.getName()}*/\r\n\trequire(${this.getIdByModule(module)});`;
                        }).join('\r\n');
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