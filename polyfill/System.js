const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/System.js") ),
    export:"System",
    require:['ClassFactor'],
    getContent(syntax){
        return `var __KEY__ = ${syntax.emitClassAccessKey()};\r\n${this.content}`;
    },
    namespace:"core"
}