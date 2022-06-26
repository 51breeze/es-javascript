const Token = require("../core/Token");
class DoWhileStatement extends Token{
   constructor(stack){
      super(stack);
      this.condition =  this.createToken(stack.condition);
      this.body = this.createToken(stack.body);
      this.createChilrenForBlock(this.body);
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
}

module.exports = DoWhileStatement;