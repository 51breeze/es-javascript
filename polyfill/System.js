const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/System.js") ),
    export:"System",
    require:[],
    isSystem:true,
    namespace:"core"
}