const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/EventDispatcher.js") ),
    export:"EventDispatcher",
    require:['Class'],
    isSystem:false,
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}