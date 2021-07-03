const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
const Polyfill = require("../core/Polyfill");
class DeclaratorDeclaration extends Syntax{
    emitter(){
        const module = this.module;
        const config = this.getConfig();
        const polyfillModule = Polyfill.modules.get(module.id);
        const content = [polyfillModule.content];
        const refs = [];
        if( !polyfillModule ){
            return null;
        }
        polyfillModule.require.forEach( name=>{
            this.addDepend( this.stack.getModuleById(name) );
        });
        this.createDependencies(module,refs);
        if( refs.length > 0 ){
            content.unshift( refs.join("\r\n") );
        }
        const comment = `/*declare ${module.getName()}*/\r\n`;
        if( config.output.mode === Constant.BUILD_OUTPUT_MERGE_FILE ){
            if( polyfillModule && polyfillModule.isSystem){
                content.push(`return ${polyfillModule.export};`);
                return `${comment}var ${module.id}=(function(){\r\n\t${content.join("\r\n").replace(/\r?\n/g,'\r\n\t')}\r\n}());`
            }
            content.push(`System.setClass(${this.getIdByModule(module)},${polyfillModule.export});`);
            return `${comment}(function(System){\r\n\t${content.join("\r\n").replace(/\r?\n/g,'\r\n\t')}\r\n}(System));`;
        }else{
            if( config.module === Constant.BUILD_REFS_MODULE_ES6 ){
                content.push(`export default ${polyfillModule.export};`)
            }else{
                content.push(`module.exports=${polyfillModule.export};`)
            }
            return `${comment}${content.join("\r\n")}`;
        }
    }
}

module.exports = DeclaratorDeclaration;