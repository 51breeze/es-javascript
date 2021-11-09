const Syntax = require("../core/Syntax");
class Property extends Syntax{

    computeValue(value,defaultValue){
        if( !defaultValue ) {
            return value;
        }
        const refName =  this.generatorVarName(this.stack, `_v`);
        const statementStack= this.stack.getParentStack( (stack)=>{
            return !!(stack.isVariableDeclaration || stack.isBlockStatement);
        });
        if( statementStack ){
            if( statementStack.isVariableDeclaration ){
                statementStack.dispatcher("insertDeclareBeforeEmit",{name:`${refName}=${value}`});
            }else if( statementStack.isVariableDeclaration ){
                statementStack.dispatcher("insert", this.semicolon(`var ${refName}=${value}`) );
            }
        }
        return `${refName} === void 0 ? ${defaultValue} : ${refName}`;
    }

    assignmentExpression(left,right){
        return `${left}=${right}`;
    }

    getSpreadRefName( target, expression){
        const desc = target.description(this);
        if( desc && (desc.isMethodDefinition || desc.isFunctionExpression)){
            return this.generatorRefName(target, '_s', 'getSpreadRefName', expression );
        }
        return expression();
    }

    emitter(){
        if( this.stack.parentStack.isObjectPattern ){
            const target = this.parentStack.parentStack.init;
            const name = this.stack.value();
            const value =this.stack.hasAssignmentPattern && this.make(this.stack.init.right);
            if( target.isObjectExpression || target.isArrayExpression){
                const init = target.attribute( name );
                return this.assignmentExpression( name, this.computeValue( this.make(init.init), init.init.isLiteral ? null : value ) );
            }else{
                const obj = target.isIdentifier ? this.make(target) : this.getSpreadRefName(target, ()=>this.make(target) );
                return this.assignmentExpression(name, this.computeValue(`${obj}.${name}`,value) );
            }
        }else{
            const key = this.stack.key.value();
            const value = this.make(this.stack.init);
            if( this.stack.parentStack.hasChildComputed ){
               const refs = this.generatorVarName(this.stack.parentStack,"_c");
               if( this.stack.key.isIdentifier && !this.stack.computed ){
                    return `${refs}.${key}=${value}`
               }else{
                    return `${refs}[${key}]=${value}`
               }
            }
            return `"${key}":${value}`;
        }
    }
}

module.exports = Property;