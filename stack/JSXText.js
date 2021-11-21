const Syntax = require("../core/Syntax");
class JSXText extends Syntax{
    getIndent(num=0){
        const level = this.getLevel( this.getIndentNum()+num );
        return level > 0 ? "\t".repeat( level ) : '';
    }

    emitter(level=0){
        const value = this.stack.value().trim();
        if( value ){  
            return `'${value}'`;
        }
        return null;
    }
}
module.exports = JSXText;
