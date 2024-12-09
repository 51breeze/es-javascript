const Compiler = require("easescript/lib/core/Compiler");
const Diagnostic = require("easescript/lib/core/Diagnostic");
const Compilation = require("easescript/lib/core/Compilation");
const path =require("path");
const {default:plugin} = require("../dist/index");

class Creator {
    constructor(options){
        const compiler = new Compiler(Object.assign({
            debug:false,
            diagnose:true,
            autoLoadDescribeFile:true,
            output:path.join(__dirname,"./build"),
            workspace:path.join(__dirname,"./src"),
            parser:{
                locations:true
            }
        },options || {}));
        this._compiler = compiler;
        this.plugin = plugin({
            emitFile:true,
            //sourceMaps:true,
            outExt:'.js',
            outDir:'test/.output',
            mode:'development',
            metadata:{
                env:{NODE_ENV:'development'},
                platform:'client',
                versions:{
                    vue:'3.0.12'
                }
            },
            module:"cjs",
        });
        this.plugin.init(compiler)
    }

    get compiler(){
        return this._compiler;
    }

    factor(file){
        return new Promise( async(resolved,reject)=>{
            const compiler = this.compiler;
            await compiler.initialize();
            await compiler.loadTypes([
                'lib/types/cookie.d.es',
                'lib/types/dom.d.es',
                'lib/types/global.d.es',
                'lib/types/socket.d.es',
                'lib/types/http.d.es',
                'lib/types/moment.d.es',
            ], {scope:'es-javascript'});
            let compilation = null;
            try{
                compilation=file ? await compiler.createCompilation(file) : new Compilation( compiler );
                await compilation.parserAsync();
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

    build( compilation ){
        this.plugin.run(compilation);
    }
}

exports.Diagnostic = Diagnostic;
exports.Creator=Creator;