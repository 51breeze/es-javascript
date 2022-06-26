const Token = require("../core/Token");
class BinaryExpression extends Token{

     createChildren(stack){
          this.left = this.createToken(stack.left);
          this.right = this.createToken(stack.right);
          this.operator = stack.node.operator;
     }
     
     make(gen){
          const operator = this.operator;
          if( operator ==="is" || operator==="instanceof" ){
               const type = stack.right.type();
               this.addDepend( type );
               if( operator !== "instanceof" && !this.compiler.callUtils("isGloableModule", type) ){
                    this.addDepend( this.getGlobalModuleById('System') );
                    return this.createStatementToken(
                         this.createCalleeToken(
                              this.createMemberToken(['System','is']),
                              [
                                   this.left,
                                   this.right
                              ]
                         )
                    ).make( gen );
               }
          }
          this.left.make( gen );
          gen.withOperator( operator );
          this.right.make( gen );
     }
}
module.exports = BinaryExpression;