const Syntax = require("../core/Syntax");
class ImportExpression extends Syntax{
   emitter(){
      const file = this.stack.source.value();
      return this.semicolon(`import('${file}')`)
   }
}

module.exports = ImportExpression;