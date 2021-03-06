const Syntax = require("../core/Syntax");
class VariableDeclaration extends Syntax {
    emitter(){
        let declareBefore = [];
        this.stack.removeAllListeners("insertDeclareBeforeEmit")
        this.stack.addListener("insertDeclareBeforeEmit",(event)=>{
            if( event && event.name){
                declareBefore.push(event.name);
            }
        });

        if( this.scope.asyncParentScopeOf && this.scope.asyncParentScopeOf === this.scope.getScopeByType("function") ){
            const fnStack = this.stack.getParentStack((stack)=>{
                return !!(stack && stack.isFunctionExpression);
            });
            let declarations = [];
            this.stack.declarations.forEach( item=>{
                if( item.isPattern ){
                    declarations = declarations.concat( item.id.properties || item.id.elements );
                }else{
                    declarations.push( item );
                }
            });
            const indent = this.getIndent(this.scope.asyncParentScopeOf.level+1, fnStack, !!fnStack.async);
            const content= this.semicolon( this.stack.declarations.filter( item=>!!(item.isPattern || item.init) ).map( item=>this.make(item) ).join(",") );
            const declaration = `${indent}var ${declareBefore.concat(declarations.map(item=>item.value())).join(",")};`;
            fnStack && fnStack.dispatcher("insertBefore", declaration);
            return content;
        }
        const kind = this.stack.kind;
        const declarations = declareBefore.concat(this.stack.declarations.map( item=>{
            return this.make(item)
        }));
        if( this.stack.flag ){
            return `${kind} ${declarations.join(",")}`;
        }
        return this.semicolon(`${kind} ${declarations.join(",")}`);
   }
}

module.exports = VariableDeclaration;