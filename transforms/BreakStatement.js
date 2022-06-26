module.exports = function(stack){
    this.label = this.createNode(stack.label);
    this.make(strem=>{
        strem.withString('break');
        if( this.label ){
            strem.withSpace();
            this.label.emit( strem );
        }
    });
}