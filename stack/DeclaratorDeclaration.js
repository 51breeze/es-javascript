const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
const Polyfill = require("../core/Polyfill");
class DeclaratorDeclaration extends Syntax{
    emitter(){
        const module = this.module;
        const polyfillModule = Polyfill.modules.get(module.id);
        const content = [ polyfillModule.getContent(this) ];
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
        if( !polyfillModule.notCreateDesc ){
            const description = [
                `'id':${Constant.DECLARE_CLASS}`,
                `'global':true`,
                `'dynamic':${!!module.dynamic}`,
                `'name':'${module.id}'`,
            ];
            content.push(this.emitCreateClassDescription(module, description, polyfillModule.export));
        }
        content.push( this.emitExportClass(module,polyfillModule.export) );
        return content.join("\r\n");
    }
}

module.exports = DeclaratorDeclaration;