const ClassDeclaration = require("./ClassDeclaration");
const Constant = require("../core/Constant");
class DeclaratorDeclaration extends ClassDeclaration{

    createChildren(stack){}

    getModuleReferenceName(module,context){
        context = context || this.module;
        if( !module )return null;
        return module.id;
    }

    make( gen ){
        const module = this.module;
        const polyfillModule = this.plugin.getPolyfill( module.getName() );
        if( !polyfillModule ){
            return null;
        }

        const content = polyfillModule.content;
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

        if( this.isActiveForModule(module.inherit) ){
            this.inherit = module.inherit;
        }

        if( polyfillModule.id !== 'Class' &&  polyfillModule.createClass !== false ){
            this.addDepend( this.getGlobalModuleById('Class') );
        }

        this.createDependencies(module).forEach( item=>item.make(gen) );
        this.createModuleAssets(module).forEach( item=>item.make(gen) );
        gen.withString( content );
        
        if( polyfillModule.id !== 'Class' && polyfillModule.createClass !== false ){
            this.createClassDescriptor(module).make( gen );
        }
        this.createExportExpression( polyfillModule.export ).make( gen );
    }
}

module.exports = DeclaratorDeclaration;