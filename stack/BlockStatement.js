const Syntax = require("../core/Syntax");
class BlockStatement extends Syntax{
    emitter(){
        const body = [];
        const before = [];
        this.stack.removeAllListeners("insert");
        this.stack.addListener("insert",(content)=>{
            if( content ){
                body.push(content);
            }
        });
        this.stack.removeAllListeners("insertBefore");
        this.stack.addListener("insertBefore",(content)=>{
            if( content ){
                before.push(content);
            }
        });
        for( let item of this.stack.body ){
            const value = this.make(item);
            if( value ){
               body.push( value );
            }
            if( item && item.isReturnStatement ){
                break;
            }
        }
        return before.concat( body ).join("\r\n");
    }
}

module.exports = BlockStatement;