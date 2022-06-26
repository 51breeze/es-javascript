const Token = require("../core/Token");
class DoWhileStatement extends Token{

   createChildren( stack ){
      this.condition =  this.createToken(stack.condition);
      this.body = this.createToken(stack.body);
   }
   
   addChildToken(token){
      const body = this.body;
      if( body && body.stack.isBlockStatement ){
          body.addChildToken( token );
      }
      return this;
   }

   addChildTokenAt(token, index){
      const body = this.body;
      if( body && body.stack.isBlockStatement ){
          body.addChildTokenAt( token, index );
      }
      return this;
   }

   make( gen ){
      gen.withString('do');
      this.body.make( gen );
      gen.withString('while');
      gen.withParenthesL();
      this.condition.make( gen );
      gen.withParenthesR();
   }
}

module.exports = DoWhileStatement;