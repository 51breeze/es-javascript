const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/Event.js") ),
    export:'Event',
    require:['Class'],
    isSystem:false,
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}