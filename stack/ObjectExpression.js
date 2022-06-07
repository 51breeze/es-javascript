const Syntax = require("../core/Syntax");
class ObjectExpression extends Syntax{

    objectExpression(properties){
        let indent = this.getIndent();
        let level = 1;
        this.stack.getParentStack( (parent)=>{
            if( parent.isProperty && parent.parentStack.isObjectExpression){
                level++;
                return false;
            }
            return true;
        });

        if( this.stack.hasChildComputed  ){
            const statementStack= this.stack.getParentStack( (stack)=>{
                return !!(stack.isVariableDeclaration || stack.isBlockStatement);
            });
            const refs =this.generatorVarName(this.stack,"_c");
            if( statementStack ){
                if( statementStack.isVariableDeclaration ){
                    statementStack.dispatcher("insertDeclareBeforeEmit",{name:refs});
                }
            }
            properties = properties.slice(0);
            properties.unshift(`${refs}={}`);
            properties.push(`${refs}`);
            indent = indent+("\t".repeat(level));
            return `(${properties.join(`,\r\n${indent}`)})`;
        }else{
            return `{${properties.join(",")}}`;
        }
    }
    objectMerge(props){
        let object = props.shift();
        while( props.length > 0 ){
            let prop = props.shift();
            object = `Object.assign(${object},${prop})`;
        }
        return object;
    }
    emitter(){
        let properties = this.stack.properties.slice(0);
        let spreadElementIndex = properties.findIndex( item=>item.isSpreadElement );
        if( spreadElementIndex >=0 ){
            let props = [];
            do{
                const [spreadElement] = properties.splice(spreadElementIndex, 1);
                const left  = properties.splice(0,spreadElementIndex);
                if( left.length > 0 || props.length == 0 )
                {
                    props.push( this.objectExpression( left.map( item=>this.make(item) ) ) );
                }
                props.push( `${this.make(spreadElement)}` );

            }while( (spreadElementIndex = properties.findIndex( item=>item.isSpreadElement ) ) >= 0 );

            if( properties.length > 0 )
            {
                props.push( this.objectExpression( properties.map( item=>this.make(item) ) ) );
            }
            return this.objectMerge(props);
        }else{
            return this.objectExpression( properties.map( item=>this.make(item) ) );
        }
    }
}

module.exports = ObjectExpression;