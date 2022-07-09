const ClassBuilder = require("./ClassBuilder")
class JSXClassBuilder extends ClassBuilder{
    getReserved(){
        return null;
    }
    createClassMemebers(stack){
       if( this.compilation.JSX ){
            this.compilation.stack.scripts.forEach( item=>{
                if( item.isJSXScript && item.isScriptProgram ){
                    super.createClassMemebers( item );
                }
            });
        }else{
            super.createClassMemebers( stack );
        }
    }
}
module.exports = JSXClassBuilder;