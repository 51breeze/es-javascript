const Compiler = require("../../easescript2/lib/core/Compiler");
const Diagnostic = require("../../easescript2/lib/core/Diagnostic");
const Compilation = require("../../easescript2/lib/core/Compilation");
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
        this.plugin = compiler.applyPlugin({plugin, options:{
            emitFile:true,
            module:"cjs",
            env:{NODE_ENV:'development'}
        }});
    }

    get compiler(){
        return this._compiler;
    }

    factor(file,source){
        return new Promise((resolved,reject)=>{
            const compiler = this.compiler;
            try{
                const compilation=file ? compiler.createCompilation(file) : new Compilation( compiler );
                compilation.parser(source);
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
        return this.plugin.make( stack );
    }

    build( compilation ){
        return this.plugin.start( compilation, (e)=>{
               if( e ){
                   console.log(e);
               }else{
                   console.log("build done!!")
               }
        });
    }
}

exports.Diagnostic = Diagnostic;
exports.Creator=Creator;