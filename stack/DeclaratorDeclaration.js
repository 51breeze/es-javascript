const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
const Polyfill = require("../core/Polyfill");
const Plugins = require("../core/Plugins");
class DeclaratorDeclaration extends Syntax{
    emitter(){
        const module = this.module;
        const polyfillModule = Polyfill.modules.get( module.getName() ) || Plugins.getPlugin(this.name).getPolyfill( module.getName() );
        if( !polyfillModule ){
            return null;
        }

        const content = [ polyfillModule.content ];
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
        this.createModuleRequires(polyfillModule,refs);
        if( refs.length > 0 ){
            let has = false;
            if( content[0] ){
                content[0] = content[0].replace(/\/\/\/__REFS__\s+?/, ()=>{
                    has = true;
                    return refs.join("\r\n");
                });
            }
            if( !has ){
                content.unshift( refs.join("\r\n") );
            }
        }
        if( polyfillModule.id !== 'Class' ){
            const description = [
                `'id':${Constant.DECLARE_CLASS}`,
                `'global':true`,
                `'dynamic':${!!module.dynamic}`,
                `'name':'${module.id}'`,
            ];
            const inherit = this.getInherit( module )
            if( inherit ){
                description.push( `'inherit':${this.getModuleReferenceName( inherit, module)}` );
            }
            content.push(this.emitCreateClassDescription(module, description, polyfillModule.export));
        }
        content.push( this.emitExportClass(module,polyfillModule.export) );
        return content.join("\r\n");
    }
}

module.exports = DeclaratorDeclaration;