const fs = require("fs");
const path = require("path");
module.exports={
    content: fs.readFileSync( path.join(__dirname,"./files/Class.js") ),
    export:'Class',
    require:[],
    notCreateDesc:true,
    isMain:true,
    getContent(syntax){
       return this.content;
    },
    namespace:"core"
}