const ClassDeclaration = require("./ClassDeclaration");
const Constant = require("../core/Constant");
class EnumDeclaration extends ClassDeclaration{
  
    createChildren( stack ){
        this.properties = stack.properties.map( item=>this.createToken(item) );
    }

    createStatementMember(name, members){
        if( !members.length )return;
        const items = [];
        members.forEach( item =>{
            const property = this.createMemberDescriptor(item.key, item.init, 'public', Constant.DECLARE_PROPERTY_ENUM_VALUE);
            items.push( property );
            const key = this.createMemberDescriptor(item.init, item.key, 'public', Constant.DECLARE_PROPERTY_ENUM_KEY);
            items.push( key );
        });
        return this.createStatementToken( 
            this.createDeclarationToken(
                'const',
                this.createDeclaratorToken(
                    name, 
                    this.createObjectToken( items )
                )
            )
        );
    }

    make(gen){
        if( this.stack.parentStack.isPackageDeclaration ){
            const module = this.module;
            if( this.isActiveForModule(this.module.inherit) ){
                this.inherit = this.createToken( stack.inherit );
            }
            this.addDepend( this.stack.getGlobalModuleById('Class') );
            this.createDependencies(module).make( gen );
            this.createDefaultConstructMethod().make( gen );
            this.createStatementMember('methods', this.properties);
            this.createClassDescriptor( module ).make( gen );
            this.createExportExpression( module.id ).make( gen );
        }else{
            const name = this.stack.value();
            gen.newLine();
            gen.withString(`var ${name} = (`);
            gen.withString(`${name}={}`);
            if( this.properties.length > 0 ){
                const len = this.properties.length-1;
                gen.withComma();
                this.properties.map( (item,index)=>{
                    gen.withString(`${name}[${name}["`);
                    item.key.make( gen );
                    gen.withString(`"]=`);
                    item.init.make( gen );
                    gen.withString(`]="`);
                    item.key.make( gen );
                    gen.withString(`"`);
                    if( index < len ){
                        gen.withComma();
                    }
                });
            }
            gen.withString(`)`);
            gen.withSemicolon();
        }
    }
}

module.exports = EnumDeclaration;