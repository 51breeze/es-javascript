module.exports = function(stack){
     this.argument = stack.argument;
     this.make(stream=>{
         stream.withString('await')
         stream.withSpace();
         this.argument.emit( stream );
     });
 }