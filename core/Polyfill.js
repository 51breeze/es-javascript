const fs = require("fs");
const path = require("path");
const modules = new Map();
const dirname = path.join(__dirname,"../","polyfill");
fs.readdirSync( dirname ).forEach( (filename)=>{
    const filepath =  path.join(dirname,filename);
    if( fs.statSync(filepath).isFile() ){
        const info = path.parse( filename );
        modules.set(info.name,require( filepath ));
    }
});

module.exports={
    path:dirname,
    modules,
}