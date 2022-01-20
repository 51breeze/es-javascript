const fs = require("fs");
const path = require("path");
const modules = new Map();
const dirname = path.join(__dirname,"../","polyfill");

const parseModule=(modules,file,name)=>{
    const info = path.parse( name );
    let content = fs.readFileSync(file).toString();
    let exportName  = info.name;
    let require  = [];
    let namespace = null;
    let requires = new Map();
    let createClass = true;
    content = content.replace( /[\r\n\s]+?\/\/\/[\s+]?<(references|namespaces|export|import|createClass)\s+(.*?)\/>\s+?/g, function(a,b,c){
        const items = c.trim().replace(/[\s+]?=[\s+]?/g,'=').split(/\s+/g);
        const attr = {};
        items.forEach(item=>{
           const [key, value] = item.replace(/[\'\"]/g,'').trim().split('=');
           attr[key] = value;
        });
        switch( b ){
            case 'references' :
                if( attr['from'] ){
                    require.push( attr['from'] );
                } 
                break;
            case 'namespaces' :
                if( attr['name'] ){
                    namespace = attr['name'];
                }
                break;
            case 'export' :
                if( attr['name'] ){
                    exportName = attr['name'];
                }
                break;
            case 'import' :
                if( attr['from'] ){
                    const name = attr['to'] || attr['name'];
                    requires.set(name, {key:name, value:name, from:attr['from'], extract:!!attr['extract']})
                }
                break;
            case 'createClass' :
                if( attr['value'] ){
                    createClass = attr['value'] !== 'false'
                }
                break;
        }
        return ''
    });

    var id = namespace ? `${namespace}.${info.name}` : info.name;
    modules.set(id, {
        id:info.name,
        content:content,
        export:exportName,
        createClass,
        require,
        requires,
        namespace
    });
}

function createEveryModule( modules,dirname ) {
    fs.readdirSync( dirname ).forEach( (filename)=>{
        const filepath =  path.join(dirname,filename);
        if( fs.statSync(filepath).isFile() ){
            parseModule(modules,filepath,filename)
        }else if( fs.statSync(filepath).isDirectory() ) {
            createEveryModule(modules,filepath );
        }
    });
}

createEveryModule( modules, dirname );

module.exports={
    path:dirname,
    modules,
    createEveryModule
}