const JSXTransform = require("../core/JSXTransform");
const instances = new Map();
function getTransform(root, ctx){
    if( instances.has(root) ){
        return instances.get(root);
    }
    const obj = new JSXTransform(root, ctx);
    instances.set(root, obj);
    return obj;
}

function JSXElement(ctx, stack){
    const obj = getTransform( stack.jsxRootElement, ctx);
    return obj.create( stack );
}
JSXElement.getTransform=getTransform;
module.exports = JSXElement;