module.exports = function(stack){
   const key = stack.isConstructor ? this.module.id : (stack.key ? stack.key.value() : null);
   this.async = stack.async ? this.createNode(stack.node.async) : null;
   this.key = key ? this.createNode('Identifier', key, stack.key && stack.key.node) : null;
   this.params = stack.params.map( item=>this.createNode(item) );
   this.body = this.createNode( stack.body );
   this.make((stream)=>{
      if( this.async ){
         stream.emitToken( this.async );
         stream.withString(' ');
      }

      stream.withString('function');
      if( this.key ){
         stream.withString(' ');
         stream.emitToken( this.key );
      }

      stream.withString('(');
      stream.emitSequence( this.params )
      stream.withString('){');
      stream.newBlock().emitToken( this.body ).endBlock();
      stream.withString('}');
   });
};