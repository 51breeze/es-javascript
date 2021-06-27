const Filesystem = require("../../core/Filesystem");
const filesystem = new Filesystem();
const modules = new Map();
filesystem.setPath( filesystem.join(__dirname, './polyfills') );

const files = filesystem.readdir(true);
files.map( filepath =>{
    const name = filesystem.basename( filepath, ".js");
    modules.set( name, require(filepath) )
});

module.exports={
    path:filesystem.path,
    files,
    modules,
}