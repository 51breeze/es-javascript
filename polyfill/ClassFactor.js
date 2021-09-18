const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/ClassFactor.js") ),
    export:"ClassFactor",
    require:[],
    isCore:true,
    namespace:"core",
}