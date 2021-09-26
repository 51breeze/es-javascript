const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/TouchDragEvent.js") ),
    export:'TouchDragEvent',
    require:['Event','TouchEvent'],
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}