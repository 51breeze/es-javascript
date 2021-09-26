const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/ScrollEvent.js") ),
    export:'ScrollEvent',
    require:['Event','PropertyEvent'],
    getContent(syntax){
        return this.content;
    },
    namespace:"core"
}