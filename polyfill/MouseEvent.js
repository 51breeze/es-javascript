const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/MouseEvent.js") ),
    export:'MouseEvent',
    require:['Event'],
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}