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
        this.dependencies = new Set();
        this.privateProperties=[];
        this.initProperties=[];
    }

    createChildren(){
        this.id = this.createToken(this.stack.id);
        this.inherit = this.createToken(this.stack.inherit);
        this.implements = this.stack.implements.map( item=>this.createToken(item) );
        this.imports = this.stack.imports.map( item=> this.createToken(item) );
        const dataset = new Map();
        this.stack.body.forEach( item=> {
            const node = this.createToken(item);
            if( item.isAccessor && item.isMethodDefinition ){
                const name = item.key.value();
                var target = dataset.get( name );
                if( !target ){
                    dataset.set( name, target={isAccessor:true,kind:'accessor'});
                    this.body.push( target );
                }
                if( item.isMethodGetterDefinition ){
                    target.get =node;
                }else if( item.isMethodGetterDefinition ){
                    target.set = node;
                }
            }else{
                this.body.push( node );
            }
        });

        this.addDepend( this.getGlobalModuleById('Class') );
        const iteratorType = this.getGlobalModuleById("Iterator")
        if( this.module.implements.includes(iteratorType) ){
            const method = this.createMethodToken( 'Symbol.iterator', (ctx)=>{
                const obj = ctx.createToken('ReturnStatement', true); 
                obj.argument = obj.createToken('ThisExpression', true);
                ctx.addChildToken( obj );
            })
            method.key.compute = true;
            this.addChildToken( method );
        }
    }

    addDepend( depModule ){
        this.dependencies.add( depModule );
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

    make(gen){
        
        this.imports.forEach( item=>item.makeEnd( gen ) );
        this.dependencies.forEach( item=>gen.makeEnd(item) );
        const module = this.module;
        const methods = this.static ? this.body : this.body.filter( item=>!!(item.static && !(item.isConstructor && item.isMethodDefinition)));
        const members = this.static ? [] : this.body.filter( item=>!(item.static || (item.isConstructor && item.isMethodDefinition)));
        const constructMethod = this.body.find( item=>item.isConstructor && item.isMethodDefinition);
        const _private = ctx.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME, this);
        if( constructMethod ){
            constructMethod.make( gen );
        }else if( this.privateProperties.length + this.initProperties.length > 0 ){
            gen.withString(`function`);
            gen.withSpace();
            gen.withString(module.id);
            gen.withParenthesL();
            gen.withParenthesR();
            gen.withBraceL();
            gen.newBlock();
            gen.newLine();
            if( this.privateProperties.length ){
                gen.withString(`Object.defineProperty`);
                gen.withParenthesL();
                gen.withString(`this`);
                gen.withComma();
                gen.withString(_private);
                gen.withComma();
                gen.withBraceL();
                gen.withString(`value`);
                gen.withColon();
                gen.withBraceL();
                this.privateProperties.forEach( item=>{
                    item.emit( gen );
                });
                gen.withBraceR();
                gen.withBraceR();
                gen.withParenthesR();
            }

            if( this.initProperties.length ){
                this.initProperties.forEach( item=>{
                    item.make( gen );
                });
            }
            gen.endBlock();
            gen.withBraceL();
        }

        const maker = (name,items)=>{
            if( !items.length )return;
            gen.withString('var');
            gen.withSpace();
            gen.withString(name);
            gen.withOperator('=');
            gen.withBraceL();
            gen.newBlock();
            const len = target.length-1;
            items.forEach( (node,index)=>{
                const key = node.key;
                const modifier = node.modifier;
                const kind = node.kind;
                const properties = [];
                properties.push({name:'m', value:MODIFIER_MAP[ modifier ]});
                properties.push({name:'id', value:kind});
                if( kind === Constant.DECLARE_PROPERTY_VAR ){
                    properties.push({name:'writable', value:true});
                }
                if( (node.isAccessor || kind === Constant.DECLARE_PROPERTY_VAR || kind === Constant.DECLARE_PROPERTY_CONST) && modifier==="public" ){
                    properties.push({name:'enumerable', value:true});
                }
                if( node.isAccessor ){
                    if( node.get ){
                        properties.push({name:'get', value:node.get});
                    }
                    if( node.set ){
                        properties.push({name:'set', value:node.set});
                    }
                }else{
                    properties.push({name:'value', value:node});
                }
                gen.withKeyValue(key, properties, key.compute);
                if( index < len ){
                    gen.withComma();
                }
            });
            gen.endBlock();
            gen.withBraceR();
        }

        maker('methods', methods );
        maker('members', members );

        const description = [];
        description.push({name:'id',value:Constant.DECLARE_CLASS});
        description.push({name:'ns',value:module.namespace.toString()});
        description.push({name:'name',value:module.id});
        if( module.dynamic ){
            description.push({name:'dynamic',value:true});
        }
        if( _private ){
            description.push({name:'private',value:_private});
        }
        if( imps.length > 0 ){
            description.push(`'imps':[${imps.map(item=>this.getModuleReferenceName(item)).join(",")}]`);
            description.push({name:'imps',value:`${imps.map(item=>this.getModuleReferenceName(item)).join(",")}`});
        }
        if( inherit ){
            description.push({name:'inherit',value:this.getModuleReferenceName( inherit, module)});
        }
        if( methods ){
            description.push({name:'methods',value:'methods'});
        }
        if( members ){
            description.push({name:'members',value:'members'});
        }
        
        const refs = this.checkRefsName( this.getClassHelper() );
        if( module && module.isFragment ){
            gen.withCall(`${refs}.creator`, ['null', module.id, new TokenChunk('ObjectExpression', description )])
        }else{
            gen.withCall(`${refs}.creator`, [this.getIdByModule(module), module.id, new TokenChunk('ObjectExpression', description )]);
        }

        if( module.isFragment ){
            return `return ${name || module.id};`;
        }

        const config = this.getConfig();
        const mod = config.module || 'commonjs';
        if( mod.toLowerCase() === 'es' ){
            return `export default ${name || module.id};`;
        }else{
            return `module.exports=${name || module.id};`;
        }

    }
}

module.exports = ClassDeclaration;