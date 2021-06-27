const Syntax = require("../core/Syntax");
class TemplateLiteral extends Syntax{
    emiter(syntax){
        const expressions = this.stack.expressions.map( item=>item.emiter(syntax) );
        return this.stack.quasis.map( (item,index)=>{
            const value = item.value().replace(/\u0022/g,'\\"')
            return expressions.length > index ? `"${value}" + (${expressions[index]})` : `"${value}"`;
        }).join(" + ");
    }
}
module.exports = TemplateLiteral;