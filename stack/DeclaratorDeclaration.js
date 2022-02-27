const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
const Polyfill = require("../core/Polyfill");
class DeclaratorDeclaration extends Syntax{

    getModuleReferenceName(module,context){
        context = context || this.module;
        if( !module )return null;
        return module.id;
    }

    emitter(){
        const module = this.module;
        const polyfillModule = Polyfill.modules.get( module.getName() ) || this.compiler.getPlugin( this.name ).getPolyfill( module.getName() );
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

        if( polyfillModule.id !== 'Class' &&  polyfillModule.createClass !== false ){
            this.addDepend( this.getGlobalModuleById('Class') )
        }

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
                description.push( `'inherit':${this.getModuleReferenceName(inherit, module)}` );
            }
            if( polyfillModule.createClass !== false ){
                content.push(this.emitCreateClassDescription(module, description, polyfillModule.export));
            }
        }
        content.push( this.emitExportClass(module,polyfillModule.export) );
        return content.join("\r\n");
    }
}

module.exports = DeclaratorDeclaration;