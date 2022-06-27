const ClassDeclaration = require("./ClassDeclaration");
class InterfaceDeclaration extends ClassDeclaration{
    createChildren(stack){
        this.id = this.createToken(stack.id);
        if( this.isActiveForModule(this.module.inherit) ){
            this.inherit = this.createToken(stack.inherit);
        }
        this.implements = stack.implements.map( item=>this.createToken(item) )
        this.addDepend( this.getGlobalModuleById('Class') );
    }

    make( gen ){
        this.createDependencies().forEach( item=>item.make(gen) );
        this.createDefaultConstructMethod().make( gen );
        this.createClassDescriptor().make( gen );
        this.createExportExpression( this.module.id ).make( gen );
    }
}

module.exports = InterfaceDeclaration;