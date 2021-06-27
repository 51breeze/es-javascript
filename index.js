const fs = require("fs");
const path = require("path");
const modules = {};
const stack = path.join(__dirname,"stack");
const files = fs.readdirSync( stack );
const excludes=["index","polyfills"];
files.forEach( (filename)=>{
    const info = path.parse( filename );
    if( !excludes.includes(info.name) ){
       modules[ info.name ] = require(  path.join(stack,filename) );
    }
});

module.exports = {
    name:'javascript',
    create(name,stack){
        const Syntax = modules[name];
        if( Syntax ){
            return new Syntax(stack);
        }
        return null;
    },
    start( make, done ){
        make((programStack)=>{

        });
    }
}