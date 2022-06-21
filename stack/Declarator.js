const Syntax = require("../core/Syntax");
class Declarator  extends Syntax {
    emitter_none(){
        return this.stack.value();
    }

    emitter(){
        let desc = this.stack.description();
        if(desc && this.compiler.callUtils("isTypeModule",desc) ){
            this.module.addDepend( desc );
        }
        if(desc && desc.isStack && desc.parentStack ){
            const ps = desc.parentStack;
            if(ps.isTryStatement && ps.hasAwait){
                const name = this.stack.value();
                return this.generatorVarName(desc, name, false, (newValue,oldValue)=>{
                    const stack = this.stack.getParentStack( stack=>!!(stack.isFunctionExpression) );
                    const content = this.semicolon( `var ${newValue}` , this.getIndent(this.scope.asyncParentScopeOf.level+1, stack, !!stack.async) );
                    if(stack){
                        stack.dispatcher('insertBefore',content);
                    }
               });
            }
        }
        return this.stack.value();
    }
}

module.exports = Declarator;