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

    emiter( syntax ){ 
        let elements = this.stack.elements.slice(0);
        let spreadElementIndex = elements.findIndex( item=>item.isSpreadElement );
        if( spreadElementIndex >=0 ){
            let props = [];
            do{
                const [spreadElement] = elements.splice(spreadElementIndex, 1);
                const left = elements.splice(0,spreadElementIndex);
                if( left.length > 0 || props.length == 0 ){
                    const elem = left.map( item=>item.emiter(syntax) );
                    props.push( this.makeArray(elem) );
                }
                props.push( spreadElement.emiter(syntax) );
            }while( (spreadElementIndex = elements.findIndex( item=>item.isSpreadElement ) ) >= 0 );
            if( elements.length > 0 ){
                props.push( this.makeArray( elements.map( item=>item.emiter(syntax) ) ) );
            }
            return this.makeSpreadArray(props);
        }else{
            return this.makeArray( elements.map( item=>item.emiter(syntax) ) );
        }
    }
}

module.exports = ArrayExpression;