//const sourceMap = require("source-map-builder");
const dataset = new Map();

function createMap(compilation){
    if( !dataset.has( compilation ) ){
        dataset.set(compilation, new sourceMap.SourceMapBuilder() )
    }
    return dataset.get(compilation);
}

module.exports ={
    create:createMap,
    sourceMaps:dataset,
}