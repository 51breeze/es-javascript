const fs = require('fs')
const path = require('path')
const compiler = require("./compiler");

const creator = new compiler.Creator();
creator.startByFile("./Test.es").then( compilation=>{
    
        const errors = compilation.compiler.errors;
        if( errors.length===0 ){
            creator.build( compilation );
        }else{
            console.log( errors )
        }
   
}).catch( error=>{

    console.log( error )
   
    
});
