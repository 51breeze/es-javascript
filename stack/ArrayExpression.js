const Syntax = require("../core/Syntax");
class ArrayExpression extends Syntax{
    
    makeArray(elements){
        return `[${elements.join(",")}]`;
    }

    makeSpreadArray(elements){
        const first = elements.shift();
        if( elements.length>0){
            return `${first}.concat(${elements.join(",")})`;
        }
        return `[].concat(${first})`;
    }

    emitter(){ 
        let elements = this.stack.elements.slice(0);
        let spreadElementIndex = elements.findIndex( item=>item.isSpreadElement );
        if( spreadElementIndex >=0 ){
            let props = [];
            do{
                const [spreadElement] = elements.splice(spreadElementIndex, 1);
                const left = elements.splice(0,spreadElementIndex);
                if( left.length > 0 || props.length == 0 ){
                    const elem = left.map( item=>this.make(item) );
                    props.push( this.makeArray(elem) );
                }
                props.push( this.make(spreadElement) );
            }while( (spreadElementIndex = elements.findIndex( item=>item.isSpreadElement ) ) >= 0 );
            if( elements.length > 0 ){
                props.push( this.makeArray( elements.map( item=>this.make(item) ) ) );
            }
            return this.makeSpreadArray(props);
        }else{
            return this.makeArray( elements.map( item=>this.make(item) ) );
        }
    }
}

module.exports = ArrayExpression;