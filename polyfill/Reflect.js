const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/Reflect.js") ),
    export:'_Reflect',
    getContent(syntax){
        return this.content;
    },
    require:['Class','System'],
    namespace:"core"
}