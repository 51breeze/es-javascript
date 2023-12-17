const path = require('path');
const Compiler = require("easescript/lib/core/Compiler");
Compiler.buildTypesManifest(
    [
        path.resolve('./types/cookie.d.es'),
        path.resolve('./types/dom.d.es'),
        path.resolve('./types/global.d.es'),
        path.resolve('./types/socket.d.es'),
    ], 
    {
        name:'es-javascript', 
        inherits:[]
    },
    './types'
);