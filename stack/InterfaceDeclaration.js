const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class InterfaceDeclaration extends Syntax{
    emitter(){
        const module = this.module;
        const imps   = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [];
        const description = [
            `id:${Constant.DECLARE_INTERFACE}`,
            `ns:'${module.namespace.toString()}'`,
            `name:'${module.id}'`
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
        parts.push(this.emitClassFactorSetHander(module, description));

        if( !config.pack && config.module === Constant.BUILD_REFS_MODULE_ES6 ){
            parts.push(`export default ${this.module.id};`)
        }else{
            parts.push(`module.exports=${this.module.id};`)
        }
        return parts.join("\r\n");
        
    }
}

module.exports = InterfaceDeclaration;