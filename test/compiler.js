const Compiler = require("easescript/lib/core/Compiler");
const Diagnostic = require("easescript/lib/core/Diagnostic");
const Compilation = require("easescript/lib/core/Compilation");
const path =require("path");
const plugin = require("../index");
class Creator {

    constructor(options){
        const compiler = new Compiler(Object.assign({
            debug:true,
            diagnose:true,
            autoLoadDescribeFile:true,
            output:path.join(__dirname,"./build"),
            workspace:path.join(__dirname,"./src"),
            parser:{
                locations:true
            }
        },options || {}));
        compiler.initialize();
        this._compiler = compiler;
    }

    get compiler(){
        return this._compiler;
    }

    factor(file,source){
        return new Promise((resolved,reject)=>{
            const compiler = this.compiler;
            const compilation = new Compilation( compiler );
            try{
                if( file ){
                    file = compiler.getFileAbsolute(file)
                }
                compilation.file = file;
                compilation.parser(source);
                compilation.checker();
                if(compilation.stack){
                    resolved(compilation);
                }else{
                    reject({compilation,errors:compiler.errors});
                }
            }catch(error){
                console.log( error )
                reject({compilation,errors:[error]});
            }
        });
    }

    startBySource(source){
        return this.factor(null, source);
    }

    startByFile(file){
        return this.factor(file);
    }

    expression( stack ){
        return plugin.make( stack );
    }

    build( compilation ){
        return plugin.start( compilation, ()=>{});
    }
}

exports.Diagnostic = Diagnostic;
exports.Creator=Creator;