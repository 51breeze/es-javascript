const Token = require("../core/Token");
const Constant = require("../core/Constant");
class InterfaceDeclaration extends Token{
    emitter(){
        const module = this.module;
        const imps   = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [];
        const description = [
            `'id':${Constant.DECLARE_INTERFACE}`,
            `'ns':'${module.namespace.toString()}'`,
            `'name':'${module.id}'`
        ];
        if( imps.length > 0 ){
            description.push(`'imps':[${imps.map( item=>item.id ).join(",")}]`);
        }
        if( inherit ){
            description.push(`'inherit':${inherit.id}`);
        }
        const construct = `function ${module.id}(){}`;
        this.addDepend( this.getGlobalModuleById('Class') );
        this.createDependencies(module,refs);
        const parts = refs.concat(construct);
        parts.push(this.emitCreateClassDescription(module, description));
        parts.push( this.emitExportClass(module) );
        return parts.join("\r\n");
    }

    constructor(stack){
        super(stack);
        super(stack);
        this.id = this.createToken(stack.id);
        this.inherit = this.createToken(stack.inherit);
        this.implements = stack.implements.map( item=>this.createToken(item) )
    }
}

module.exports = InterfaceDeclaration;