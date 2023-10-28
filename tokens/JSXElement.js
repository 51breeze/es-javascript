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
    if( stack && stack.isComponent ){
        const desc = stack.description();
        if(desc && desc.isModule && !ctx.builder.checkRuntimeModule(desc) ){
            return null;
        }
    }
    if(ctx.isRawJsx()){
        const node = ctx.createNode( stack );
        node.openingElement = node.createToken( stack.openingElement );
        node.children = stack.children.map( child=>node.createToken(child) );
        node.closingElement = node.createToken( stack.closingElement );
        return node;
    }
    const obj = getTransform( stack.jsxRootElement, ctx);
    return obj.create( stack, ctx );
}
JSXElement.getTransform=getTransform;
module.exports = JSXElement;