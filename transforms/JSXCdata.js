const Syntax = require("../core/Syntax");
class JSXCdata extends Syntax{
    emitter(level=0){
        let value = this.stack.value();
        if( value ){  
            return `'${value.replace(/[\r\n]+/g,'').replace(/\'/g,"\\'")}'`;
        }
        return null;
    }
}
module.exports = JSXCdata;