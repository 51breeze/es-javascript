const Syntax = require("../core/Syntax");
class UnaryExpression extends Syntax {
   emitter(){
       const operator = this.stack.node.operator;
       const prefix   = this.stack.node.prefix;
       if( prefix ){
         if( operator==="typeof"){
            return `${operator} ${this.make(this.stack.argument)}`;
         }else if( operator==='delete' && this.stack.argument.isMemberExpression ){
            const desc = this.stack.argument.description();
            if( desc && desc.isAnyType ){
               let isReflect = false
               const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
               if( !hasDynamic && !this.compiler.callUtils("isLiteralObjectType", this.stack.argument.object.type() ) ){
                  isReflect = true;
               }
               if( isReflect ){
                  this.addDepend( this.stack.getGlobalTypeById("Reflect") );
                  const object = this.make( this.stack.argument.object );
                  const property = this.make( this.stack.argument.property );
                  if( this.stack.argument.computed ){
                     return `${this.checkRefsName("Reflect")}.deleteProperty(${object},${property})`;
                  }else{
                     return `${this.checkRefsName("Reflect")}.deleteProperty(${object},'${property}')`;
                  }
               }
            }
         }
         return `${operator} ${this.make(this.stack.argument)}`;
       }
       return `${this.make(this.stack.argument)}${operator}`;
   }
}

module.exports = UnaryExpression;