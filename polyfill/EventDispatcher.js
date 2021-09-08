const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/EventDispatcher.js") ),
    export:"EventDispatcher",
    require:[],
    isSystem:false,
    namespace:"core"
}