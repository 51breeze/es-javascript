const fs = require('fs')
const path = require('path')
const compiler = require("./compiler");
const root = path.join(__dirname,'./specs');
const specs = fs.readdirSync( root );
//specs.forEach(file=>require(path.join(root,file)));

describe('compile file', function() {
    const creator = new compiler.Creator();
    creator.startByFile("./Test.es").then( compilation=>{
        it('should compile success and build', function() {
            const errors = compilation.compiler.errors;
            expect('Expected 0 errors').toContain( errors.length );
            if( errors.length===0 ){
                creator.build( compilation );
            }else{
                errors.forEach((error)=>{
                    fail( error.toString() );
                });
            }
        });
    }).catch( error=>{
        const errors=error.errors;
        it(`compiler failed 'Test.es'`, function() {
            errors && errors.forEach((error)=>{
                fail( error.message );
            });
        });
    });
});