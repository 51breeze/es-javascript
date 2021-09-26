const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/TouchEvent.js") ),
    export:'TouchEvent',
    require:['Event'],
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}