const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/Reflect.js") ),
    export:"_Reflect",
    getContent(syntax){
        return `var __KEY__ = ${syntax.emitClassAccessKey()};\r\n${this.content}`;
    },
    require:["System",'ClassFactor'],
    namespace:"core"
}