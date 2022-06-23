module.exports = function(stack){
    this.expression = this.createNode( stack );
    this.make((stream)=>{
        stream.emitEnd( this.expression );
    });
 };