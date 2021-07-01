const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class InterfaceDeclaration extends Syntax{
    emiter(syntax){
        const module = this.module;
        const imps   = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [];
        const description = [
            `id:${Constant.DECLARE_INTERFACE}`,
            `ns:"${module.namespace.toString()}"`,
            `name:"${module.id}"`
        ];
        if( imps.length > 0 ){
            description.push(`imps:[${imps.map( item=>item.id ).join(",")}]`);
        }
        if( inherit ){
            description.push(`inherit:${inherit.id}`);
        }
        const construct = `function ${module.id}(){}`;
        this.createDependencies(module,refs);

        const config  = this.getConfig();
        const parts = refs.concat(construct);
        parts.push(`System.setClass(${this.getIdByModule(module)},${module.id},${this.getDescription(description)});`);

        if( config.output.mode === Constant.BUILD_OUTPUT_MERGE_FILE ){
            parts.push(`module.exports = ${this.module.id};`);
            return `/*interface ${module.getName()}*/\r\nfunction(exports,module,require){\r\n\t${parts.join("\r\n").replace(/\r\n/g,'\r\n\t')}\r\n}`;
        }else{
            if( config.module === Constant.BUILD_REFS_MODULE_ES6 ){
                parts.push(`export default ${this.module.id};`)
            }else{
                parts.push(`module.exports=${this.module.id};`)
            }
            return parts.join("\r\n");
        }
    }
}

module.exports = InterfaceDeclaration;