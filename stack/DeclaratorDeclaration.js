const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
const Polyfill = require("../core/Polyfill");
const fs = require("fs");
class DeclaratorDeclaration extends Syntax{
    emitter(){
        const module = this.module;
        const polyfillModule = Polyfill.modules.get(module.id);
        if( module.require ){
            return fs.readFileSync(module.file);
        }
        if( !polyfillModule ){
            return null;
        }

        const content = [ polyfillModule.getContent(this) ];
        const refs = [];
        
        polyfillModule.require.forEach( name=>{
            const module = this.stack.getModuleById(name);
            if( module ){
                this.addDepend( module );
            }else{
                this.error(`the '${name}' dependency does not exist`);
            }
        });

        module.extends.forEach( dep=>{
            if( dep.isClass ){
                this.addDepend( dep );
            } 
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