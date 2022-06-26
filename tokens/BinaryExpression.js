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
                    ctx.addDepend( this.getGlobalModuleById('System') );
                    gen.withString( this.checkRefsName('System') );
                    gen.withDot();
                    gen.withString('is');
                    gen.withParenthesL();
                    this.left.make( gen );
                    gen.withComma();
                    this.right.make( gen );
                    gen.withParenthesR();
                    return;
               }
          }
          this.left.make( gen );
          gen.withOperator( operator );
          this.right.make( gen );
     }
}
module.exports = BinaryExpression;