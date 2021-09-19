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

        const parts = refs.concat(construct);
        parts.push(this.emitCreateClassDescription(module, description));
        parts.push( this.emitExportClass(module) );
        return parts.join("\r\n");
    }
}

module.exports = InterfaceDeclaration;