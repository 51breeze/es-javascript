const Syntax = require("../core/Syntax");
class RestElement extends Syntax{

    getSpreadRefName( target, expression){
        const desc = target.description();
        if( desc && (desc.isMethodDefinition || desc.isFunctionExpression)){
            return this.generatorRefName(target, '_s', 'getSpreadRefName', expression );
        }
        return expression();
    }

    emitter(){
        const name = this.stack.value();
        if( this.stack.parentStack.isObjectPattern ){
           const target = this.stack.parentStack.parentStack.init;
           const properties = this.stack.parentStack.properties.filter( item=>item !== this.stack ).map( item=>item.value() );
           this.addDepend( this.getGlobalModuleById("System") );
           const obj = target.isIdentifier ? this.make(target) : this.make(this.getSpreadRefName(target, ()=>target) );
           if( properties.length > 0 ){
                return `${name}=${this.checkRefsName('System')}.toArray(${obj},["${properties.join('","')}"])`;
           }else{
                return `${name}=${this.checkRefsName('System')}.toArray(${obj})`;
           }
        }else if( this.stack.parentStack.isArrayPattern ){
            const index = this.stack.parentStack.elements.indexOf( this.stack );
            const target = this.stack.parentStack.parentStack.init;
            const obj = this.make(this.getSpreadRefName(target, ()=>target) );
            return `${name}=${obj}.slice(${index})`;
        }
        return name;
    }
}

module.exports = RestElement;