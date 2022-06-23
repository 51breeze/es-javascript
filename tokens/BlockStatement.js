module.exports = function(stack){
   stack.body.forEach( child=>{
      this.addChild( this.createNode( child ) )
   });
   this.make((stream)=>{
      this.getChildren().forEach( child=>{
         stream.emitToken( child );
      });
   });
};