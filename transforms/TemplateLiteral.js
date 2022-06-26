const Syntax = require("../core/Syntax");
class TemplateLiteral extends Syntax{
    emitter(){
        const expressions = this.stack.expressions.map( item=>this.make(item) );
        return this.stack.quasis.map( (item,index)=>{
            const value = item.value().replace(/\u0022/g,'\\"')
            return expressions.length > index ? `"${value}" + (${expressions[index]})` : `"${value}"`;
        }).join(" + ");
    }
}
module.exports = TemplateLiteral;