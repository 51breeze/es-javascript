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
    if( stack.jsxRootElement === stack ){
        if( stack.compilation.JSX && stack.parentStack.isProgram ){

        }else{
            const block =  ctx.type === "BlockStatement" && ctx.parent.type ==="MethodDefinition" ? ctx : ctx.getParentByType( ctx=>{
                return ctx.type === "BlockStatement" && ctx.parent.type ==="MethodDefinition"
            })
            if( block ){
                block.body.unshift( obj.createElementHandleNode(stack) );
            }
        }
    }
    return obj.create( stack );
}
module.exports = JSXElement;