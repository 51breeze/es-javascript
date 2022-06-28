const FunctionDeclaration = require("./FunctionDeclaration");
module.exports = function(ctx,stack,type){
   const node = FunctionDeclaration(ctx,stack,type);
   node.static = !!stack.static;
   node.modifier = stack.complier.callUtils('getModifierValue', stack);
   node.kind = 'method';
   return node;
}