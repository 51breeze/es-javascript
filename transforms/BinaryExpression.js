module.exports = function(stack,ctx){
     this.left = this.createNode(stack.left);
     this.right = this.createNode(stack.right);
     const operator = stack.node.operator;
     this.make( stream=>{
          if( operator ==="is" || operator==="instanceof" ){
               const type = stack.right.type();
               ctx.addDepend( type );
               if( operator !== "instanceof" && !this.compiler.callUtils("isGloableModule", type) ){
                    ctx.addDepend( ctx.getGlobalModuleById('System') );
                    stream.withString( ctx.checkRefsName('System') );
                    stream.withDot();
                    stream.withString('is');
                    stream.withParenthesL();
                    this.left.emit( stream );
                    stream.withComma();
                    this.right.emit( stream );
                    stream.withParenthesR();
                    return;
               }
          }
          this.left.emit( stream );
          stream.withOperator( operator );
          this.right.emit( stream );
     });
}