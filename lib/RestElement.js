const Syntax = require("../core/Syntax");
class RestElement extends Syntax{

    getSpreadRefName( target, expression){
        const desc = target.description(this);
        if( desc && (desc.isMethodDefinition || desc.isFunctionExpression)){
            return this.generatorRefName(target, '_s', 'getSpreadRefName', expression );
        }
        return expression();
    }

    emiter(syntax){
        const name = this.stack.value();
        if( this.stack.parentStack.isObjectPattern ){
           const target = this.stack.parentStack.parentStack.init;
           const properties = this.stack.parentStack.properties.filter( item=>item !== this.stack ).map( item=>item.value() );
           this.module.addDepend( this.stack.getModuleById("System") );
           const obj = target.isIdentifier ? target.emiter(syntax) : this.getSpreadRefName(target, ()=>target.emiter(syntax) );
           if( properties.length > 0 ){
                return `${name}=System.toArray(${obj},["${properties.join('","')}"])`;
           }else{
                return `${name}=System.toArray(${obj})`;
           }
        }else if( this.stack.parentStack.isArrayPattern ){
            const index = this.stack.parentStack.elements.indexOf( this.stack );
            const target = this.stack.parentStack.parentStack.init;
            const obj = this.getSpreadRefName(target, ()=>target.emiter(syntax) );
            return `${name}=${obj}.slice(${index})`;
        }
        return name;
    }
}

module.exports = RestElement;