module.exports = function(stack){
    this.left = this.createNode(stack.left);
    this.right = this.createNode(stack.right);
    this.make(stream=>{
        this.left.emit( stream );
        stream.withOperator('=');
        this.right.emit( stream );
    });
}