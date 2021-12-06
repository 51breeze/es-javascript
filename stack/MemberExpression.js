const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class MemberExpression extends Syntax{
   emitter(){
      const module = this.module;
      const property = this.stack.property.isIdentifier ? this.stack.property.value() : this.make(this.stack.property);
      const object = this.make(this.stack.object);
      const description = this.stack.description();
      const option = this.getConfig();
      // if(description && (description.isMethodDefinition || (description.isVariableDeclarator && description.parentStack.isPropertyDefinition))){
      //    let parent = this.stack.parentStack;
      //    while(parent && parent.isMemberExpression){
      //       parent = parent.parentStack;
      //    }
      //    parent.isSyntaxRemoved = !this.checkMetaTypeSyntax(description.parentStack.metatypes);
      //    if( parent.isSyntaxRemoved ){
      //       if( !(parent.isExpressionStatement || parent.isCallExpression ) ){
      //           this.stack.error("the expression is removed.");
      //       }
      //    }
      // }

      if( description && description.isModule && this.compiler.callUtils("isTypeModule",description) ){
         this.addDepend( description );
      }else if( this.compiler.callUtils("isTypeModule",this.stack.object.description()) ){
         this.addDepend( this.stack.object.description() );
      }

      if(this.stack.computed){
         if( option.target === "es5" || !this.compiler.callUtils("isLiteralObjectType", this.stack.object.type()) ){
            this.addDepend( this.stack.getModuleById("Reflect") );
            return `${this.checkRefsName("Reflect")}.get(${module.id},${object},${property})`;
         }
         return `${object}[${property}]`;
      }

      if( description && description.isType && description.isAnyType ){
         this.addDepend( this.stack.getModuleById("Reflect") );
         return `${this.checkRefsName("Reflect")}.get(${module.id},${object},"${property}")`;
      }

      if( option.target === "es5" && description && description.isMethodGetterDefinition ){
         const name = this.compiler.callUtils("firstToUpper", property);
         if( this.stack.object.isSuperExpression ){
            return `${object}.get${name}.call(this)`;
         }
         return `${object}.get${name}()`;
      }

      if(description && description.isMethodDefinition){
         const modifier =description.modifier.value();
         const refModule = description.module;
         if(modifier==="private" && refModule.children.length > 0){
             return `${this.module.id}.prototype.${property}`;
         }
      }
      
      if( this.compiler.callUtils("isClassType", description) ){
         this.addDepend( description );
         return this.getModuleReferenceName(description,module);
      }
      
      if( this.stack.object.isSuperExpression ){
         if( description && description.isMethodGetterDefinition ){
            return `${object}[${this.emitClassAccessKey()}].members.${property}.get.call(this)`;
         }else if(description && description.isMethodSetterDefinition ){
            return `${object}[${this.emitClassAccessKey()}].members.${property}.set`;
         }else{
            return `${object}.prototype.${property}`;
         }
      }

      if(description && description.isPropertyDefinition && description.modifier && description.modifier.value() === "private"){
         return `${object}[${this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)}].${property}`;
      }
      return `${object}.${property}`;
   }
}

module.exports = MemberExpression;
