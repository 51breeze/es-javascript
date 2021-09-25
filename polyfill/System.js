const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/System.js") ),
    export:'System',
    require:['Class','EventDispatcher'],
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}