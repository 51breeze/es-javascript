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

    emiter( syntax ){
        const init = this.stack.parentStack.init;
        const initValue = this.stack.parentStack.init.emiter(syntax);
        const is = init.isArrayExpression;
        const elements = this.stack.elements.map( (item,index)=>{
            if( item.isRestElement ){
                return item.emiter(syntax)
            }
            const name = item.value();
            const defaultValue = item.isAssignmentPattern ? item.right.emiter(syntax) :  null;
            if( is ){
                const value = init.attribute( index );
                if( value ){
                   const right = this.computeValue( value.emiter(syntax), value.isLiteral ? null : defaultValue );
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