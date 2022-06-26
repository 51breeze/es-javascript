const Syntax = require("../core/Syntax");
class JSXFragment extends Syntax{
    getIndent(num=0){
        const level = this.getLevel( this.getIndentNum()+num );
        return level > 0 ? "\t".repeat( level ) : '';
    }
    emitter(level=0){
       const children = this.stack.children.map( child=>this.make(child) );
       const handle = this.getJsxCreateElementHandle();
       const inline = this.getIndent(level);
       return `${inline}${handle}(null,null,[${children.join(',')}])`;
    }
}

module.exports = JSXFragment;