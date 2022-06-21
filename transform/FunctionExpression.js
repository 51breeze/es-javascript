function FunctionExpression(stack){
   const key = stack.isConstructor ? this.module.id : (stack.key ? stack.key.value() : null);
   this.async = stack.async ? this.createInstanceByType('Identifier').genToken('async') : null;
   this.key = key ? this.createInstanceByType('Identifier').genToken(key) : null;
   this.params = stack.params.map( item=>this.createInstanceByStack(item) );
   this.body = this.createInstanceByStack( stack.body );
}
module.exports = FunctionExpression;