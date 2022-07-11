const FunctionDeclaration = require("./FunctionDeclaration");
module.exports = function(ctx,stack,type){
   const node = FunctionDeclaration(ctx,stack,type);
   node.async = stack.expression.async ? true : false;
   node.static = !!stack.static;
   node.modifier = stack.compiler.callUtils('getModifierValue', stack);
   node.kind = 'method';
   return node;
}