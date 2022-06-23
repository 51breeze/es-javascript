const sourceMap = require('source-map');


var gen = new sourceMap.SourceMapGenerator({
    file:'dist.js'
});

gen.addMapping({
    source: "add.es",
    original: { line: 128, column: 0 },
    generated: { line: 3, column: 456 },
    name:'name'
})

gen.addMapping({
    source: "add.es",
    original: { line: 256, column: 3 },
    generated: { line:4, column: 200 },
    name:'3'
})



console.log( gen.toString() )