const JSXElement = require("./JSXElement")
class JSXScript extends JSXElement{
    emitter( level=0 ){
        if( this.parentStack === this.stack.jsxElement.jsxRootElement ){
            return this.make( this.compilation.stack );
        }else{
            const data = this.getElementConfig();
            this.createAttributes(data, []);
            return this.makeElement(
                this.make(this.stack.openingElement),
                data, 
                this.stack.body,
                level
            );
        }
    }
}

module.exports = JSXScript;