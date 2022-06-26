module.exports = function(stack){
    this.elements = stack.elements.map( (item)=>{
        return this.createNode(item)
    }); 
    this.make( (stream)=>{
        this.withBracketL();
        stream.emitSequence( this.elements );
        this.withBracketR();
        const parent = this.getParent();
        if( parent.init ){
            this.withOperator('=');
            parent.init.emit( stream );
        }
    });
}