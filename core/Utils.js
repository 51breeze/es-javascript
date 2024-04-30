function parseResource(id) {
    if(id.includes('?')){
        const [resourcePath, rawQuery] = id.split(`?`, 2);
        const query = Object.fromEntries(new URLSearchParams(rawQuery));
        return {
            resourcePath,
            query
        };
    }else{
        return {
            resourcePath:id,
            query:{}
        };
    }
}

module.exports = {
    parseResource
}