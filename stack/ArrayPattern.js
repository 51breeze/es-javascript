const Syntax = require("../core/Syntax");
class ArrayPattern extends Syntax {

    computeValue(value,defaultValue){
        if( !defaultValue ) {
            return value;
        }
        return `${value} || ${defaultValue}`;
    }

    getSpreadRefName( target, expression){
        const desc = target.description(this);
        if( desc && (desc.isMethodDefinition || desc.isFunctionExpression || target.isNewExpression)){
            return this.generatorRefName(target, '_s', 'getSpreadRefName', expression );
        }
        return expression();
    }

    emitter_none(){
        const init = this.make(this.stack.parentStack.init);
        const elements = this.stack.elements.map( item=>this.make(item) );
        if( init ){
            return `[${elements.join(',')}]=${init}`;
        }
        return `[${elements.join(',')}]`;
    }

    emitter(){
        const init = this.stack.parentStack.init;
        const initValue = this.make(init);
        const is = init.isArrayExpression;
        const elements = this.stack.elements.map( (item,index)=>{
            if( item.isRestElement ){
                return this.make(item)
            }
            const name = item.value();
            const defaultValue = item.isAssignmentPattern ? this.make(item.right) :  null;
            if( is ){
                const value = init.attribute( index );
                if( value ){
                   const right = this.computeValue( this.make(value), value.isLiteral ? null : defaultValue );
                   return `${name}=${right}`;
                }else if(defaultValue){
                   return `${name}=${defaultValue}`;
                }else {
                    return name;
                }
            }else{
                const obj = init.isIdentifier ? initValue : this.getSpreadRefName(init, ()=>initValue);
                const right = this.computeValue( `${obj}[${index}]`, defaultValue )
                return `${name}=${right}`;
            }
        });
        return elements;
    }
}

module.exports = ArrayPattern;