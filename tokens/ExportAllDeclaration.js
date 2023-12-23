module.exports = function(ctx,stack){
    const node = ctx.createNode(stack);
    node.exported = node.createToken(stack.exported);
    node.source = node.createToken(stack.source);
    const compilation = stack.getResolveCompilation();
    if(compilation && compilation.stack){
        const resolve = stack.getResolveFile();
        const source = ctx.builder.getModuleImportSource(resolve, stack.compilation.file);
        node.source = node.createLiteralNode(source);
        node.builder.make(compilation, compilation.stack);
    }
    return node;
 }