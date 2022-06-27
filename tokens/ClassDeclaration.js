const Token = require("../core/Token");
const Constant = require("../core/Constant");
const MODIFIER_MAP={
    "public":Constant.MODIFIER_PUBLIC,
    "protected":Constant.MODIFIER_PROTECTED,
    "private":Constant.MODIFIER_PRIVATE,
}

class ClassDeclaration extends Token{
    constructor(type){
        super(type);
        this.body = [];
        this.privateProperties=[];
        this.initProperties=[];
    }

    createChildren(stack){
        this.id = this.createToken(stack.id);
        if( this.isActiveForModule(this.module.inherit) ){
            this.inherit = this.createToken(stack.inherit);
            this.addDepend( this.module.inherit );
        }

        this.implements = this.stack.implements.filter( item=>{
            const impModule = item.getModuleById( item.value() );
            return !impModule.isDeclaratorModule && impModule.isInterface;
        }).map( item=>this.createToken(item) );

        this.imports = this.stack.imports.map( item=> this.createToken(item) );
        this.methods = [];
        this.members = [];
        this.construct = null;
        const caches = [new Map(), new Map()];
        stack.body.forEach( item=> {
            const node = this.createToken(item);
            const static = !!(stack.static || node.static);
            const refs  = static ? this.methods : this.members;
            if( item.isMethodGetterDefinition || item.isMethodGetterDefinition ){
                const name = item.key.value();
                const dataset = static ? caches[1] : caches[0];
                var target = dataset.get( name );
                if( !target ){
                    dataset.set( name, target={isAccessor:true,kind:item.kind});
                    refs.push( target );
                }
                if( item.isMethodGetterDefinition ){
                    target.get =node;
                }else if( item.isMethodGetterDefinition ){
                    target.set = node;
                }
            }else if(item.isConstructor && item.isMethodDefinition){
                this.construct = node;
            }
            else{
                refs.push( node );
            }
        });

        this.addDepend( this.compilation.getGlobalModuleById('Class') );
        const iteratorType = this.compilation.getGlobalModuleById("Iterator")
        if( this.module.implements.includes(iteratorType) ){
            const method = this.createMethodToken( 'Symbol.iterator', (ctx)=>{
                const obj = ctx.createToken('ReturnStatement', true); 
                obj.argument = obj.createToken('ThisExpression', true);
                ctx.addChildToken( obj );
            });
            method.key.compute = true;
            this.addChildToken( method );
        }

    }

    addChildToken(token){
        const children = this.body;
        children.push( token );
        token.parent = this;
        return this;
    }
 
    addChildTokenAt(token, index){
        const children = this.body;
        if( index < 0 ){
            index = children.length + index;
        }else if( index > children.length ){
            index = children.length;
        }
        children.splice(index,0,token);
        token.parent = this;
        return this;
    }

    createDefaultConstructMethod(_private){
        return this.createMethodToken( this.module.id , (ctx)=>{
            if( this.privateProperties.length ){
                ctx.addChildToken(
                    this.createStatementToken( 
                        this.createCalleeToken( 
                            this.createMemberToken(['Object','defineProperty']),
                            [
                                this.createToken('ThisExpression',true),
                                this.createIdentifierToken(_private),
                                this.createObjectToken( Object.entries({value:this.createObjectToken( this.privateProperties )}) )
                            ]
                        )
                    )
                );
            }
            if( this.initProperties.length ){
                this.initProperties.forEach( item=>{
                    ctx.addChildToken(item);
                });
            }
        });
    }

    createMemberDescriptor(key, node, modifier, kind){
        kind =kind || node.kind;
        modifier = modifier || node.modifier;
        const properties = [];
        properties.push( this.createPropertyToken('m', MODIFIER_MAP[ modifier ]) );
        properties.push( this.createPropertyToken('id', kind) );
        if( kind === Constant.DECLARE_PROPERTY_VAR ){
            properties.push( this.createPropertyToken('writable', true) );
        }
        if( (node.isAccessor || kind === Constant.DECLARE_PROPERTY_VAR || kind === Constant.DECLARE_PROPERTY_CONST) && modifier==="public" ){
            properties.push( this.createPropertyToken('enumerable', true) );
        }
        if( node.isAccessor ){
            if( node.get ){
                properties.push( this.createPropertyToken('get', node.get) ); 
            }
            if( node.set ){
                properties.push( this.createPropertyToken('set', node.set) );
            }
        }else{
            properties.push( this.createPropertyToken('value', node) );
        }
        return this.createPropertyToken(key,this.createObjectToken( properties ));
    }

    createClassDescriptor(module,_private){
        const description = [];
        description.push(this.createPropertyToken('id', Constant.DECLARE_CLASS));
        description.push(this.createPropertyToken('ns', this.createLiteralToken( `"${module.namespace.toString()}"` ) ) );
        description.push(this.createPropertyToken('name', module.id));
        if( module.dynamic ){
            description.push(this.createPropertyToken('dynamic',String(true)));
        }
        if( _private ){
            description.push(this.createPropertyToken('private',_private));
        }
        const imps = this.module.implements.filter( item=>item.isInterface && !item.isDeclaratorModule );
        if( imps.length > 0 ){
            description.push(this.createPropertyToken('imps', this.createArrayToken(
                imps.map( item=>this.getModuleReferenceName(item) )
            )));
        }
        if( this.inherit ){
            description.push(this.createPropertyToken('inherit',this.getModuleReferenceName(this.module.inherit, module)));
        }
        if( this.methods.length ){
            description.push(this.createPropertyToken('methods', 'methods'));
        }
        if( this.members.length ){
            description.push(this.createPropertyToken('members', 'members'));
        }
        
        const args = [this.getIdByModule(module), module.id, this.createObjectToken(description)]
        if( module && module.isFragment ){
            args[0] = 'null';
        }
        return this.createStatementToken( this.createCalleeToken( this.createMemberToken([this.checkRefsName('Class'),'creator']), args) );
    }

    createExportExpression( id ){
        return this.createStatementToken( 
            this.createAssignmentToken(
                this.createMemberToken(['module','exports']), 
                this.createIdentifierToken(id) 
            )
        );
    }

    createStatementMember(name, members){
        if( !members.length )return;
        return this.createStatementToken( 
            this.createDeclarationToken(
                'const',
                this.createDeclaratorToken(
                    name, 
                    this.createObjectToken( members.map( node=>this.createMemberDescriptor(node.key, node) ) )
                )
            )
        );
    }

    createDependencies(){
        const items = [];
        const module = this.module;
        const dependencies = this.builder.getDependencies(module);
        dependencies.forEach( depModule =>{
            if( this.isActiveForModule( depModule ) ){
                const name = this.builder.getModuleReferenceName(depModule, module);
                const source = this.builder.getModuleImportSource(depModule, module);
                items.push( this.createImportToken( source, [[null,name]]) );
            }
        });
        return items;
    }

    createModuleAssets(){
        const assets = this.builder.getModuleAssets( this.module ).map( item=>{
            return this.createImportToken( item.source, [[item.imported,item.local]]);
        });
        return assets;
    }

    make(gen){

        var construct = this.construct;
        const module = this.module;
        const methods = this.methods;
        const members = this.members;
        const _private = this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME);
        
        this.imports.forEach( item=>item.make( gen ) );
        this.createDependencies().forEach( token=>token.make(gen) );
        this.createModuleAssets().forEach( token=>token.make(gen) );
        this.body.forEach( item=>gen.make(item) );
        
        if( !construct && (this.privateProperties.length + this.initProperties.length) > 0 ){
            construct = this.createDefaultConstructMethod( _private );
        }

        if( construct ){
            construct.make( gen );
        }

        this.createStatementMember(gen, 'methods', methods ).make( gen );
        this.createStatementMember(gen, 'members', members ).make( gen );

        this.createClassDescriptor(module,_private).make( gen );
        this.createExportExpression( module.id ).make( gen );
    }
}

module.exports = ClassDeclaration;