const Token = require("../core/Token");
class Literal extends Token{
     getValue(){
          if( this.stack ){
               return this.stack.raw();
          }else{
               return this.value || '';
          }
     }

     make( gen ){
          gen.withString( this.getValue() );
     }
}
module.exports = Literal;