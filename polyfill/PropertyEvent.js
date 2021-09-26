const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/PropertyEvent.js") ),
    export:'PropertyEvent',
    require:['Event'],
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}