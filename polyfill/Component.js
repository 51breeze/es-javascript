const fs = require("fs");
const path = require("path");
module.exports={
    content: null,
    export:'Component',
    require:['Class','web.Vue'],
    getContent(syntax){
        const component = syntax.getConfig('webComponent');
        if( component === 'vue'){
            this.content= fs.readFileSync( path.join(__dirname,"./files/components/Vue.js") );
        }else{
            this.content= fs.readFileSync( path.join(__dirname,"./files/components/Vue.js") ); 
        }
        return this.content;
    },
    namespace:"web.components"
}