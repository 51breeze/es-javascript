module.exports = function(stack,ctx){
    this.elements = stack.elements.map( item=>this.createNode(item) );
    this.make((stream)=>{
        this.withBracketL();
        stream.emitSequence( this.elements );
        this.withBracketR();
    });
}