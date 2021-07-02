const Syntax = require("../core/Syntax");
class CallExpression extends Syntax{

    makeSpreadCall(syntax){
        const args = this.stack.arguments.map( item=>item.emiter(syntax));
        const spread = args.pop();
        const desc = this.stack.callee.description(this);
        if( this.stack.callee.isMemberExpression ){
            if( desc.isType && desc.isAnyType  ){
                this.addDepend( this.stack.getModuleById("Reflect") );
                if( this.stack.arguments.length > 0 ){
                    return `${this.checkRefsName("Reflect")}.call(${this.module.id},${this.stack.callee.object.emiter(syntax)},"${this.stack.callee.property.value()}",[${args.join(",")}].concat(${spread}))`;
                }else{
                    return `${this.checkRefsName("Reflect")}.call(${this.module.id},${this.stack.callee.object.emiter(syntax)},"${this.stack.callee.property.value()}")`;
                }
            }
        }

        const callee= this.stack.callee.emiter(syntax);
        if(this.stack.callee.isSuperExpression){
            return `${callee}.apply(this,[${args.join(",")}].concat(${spread}))`;
        }else if(this.stack.callee.isMemberExpression && this.stack.callee.object.isSuperExpression){
            if( this.stack.callee.object.isMemberExpression ){
                return `${callee}.apply(${this.stack.callee.object.emiter(syntax)},[${args.join(",")}].concat(${spread}))`;
            }
            return `${callee}.apply(this,[${args.join(",")}].concat(${spread}))`;
        }
        if( this.stack.isSyntaxRemoved ){
            if(this.stack.parentStack.isExpressionStatement){
                this.stack.parentStack.isSyntaxRemoved = true;
            }else{
                this.stack.error("the expression is removed.");
            }
        }
        if(desc.isMethodDefinition){
            const modifier =desc.modifier.value();
            const refModule = desc.module;
            if( modifier==="private" && refModule.children.length > 0){
                if( this.stack.callee.isMemberExpression ){
                    return `${callee}.apply(${this.stack.callee.object.emiter(syntax)}, [${args.join(",")}].concat(${spread}))`;
                }
            }
        }
        return `${callee}.apply(this,[${args.join(",")}].concat(${spread}))`;
    }
    
    emiter( syntax ){
        const hasSpread = this.stack.arguments.some(item=>!!item.isSpreadElement );
        if( hasSpread ){
            return this.makeSpreadCall(syntax);
        }
        const args = this.stack.arguments.map( item=>item.emiter(syntax));
        const desc = this.stack.callee.description();
        if( this.compiler.callUtils("isTypeModule", desc) ){
            this.addDepend( desc );
        }
        if( this.stack.callee.isMemberExpression ){
            if( desc && desc.isType && desc.isAnyType  ){
                this.addDepend( this.stack.getModuleById("Reflect") );
                if( args.length > 0 ){
                    return `${this.checkRefsName("Reflect")}.call(${this.module.id},${this.stack.callee.object.emiter(syntax)},"${this.stack.callee.property.value()}",[${args.join(",")}])`;
                }else{
                    return `${this.checkRefsName("Reflect")}.call(${this.module.id},${this.stack.callee.object.emiter(syntax)},"${this.stack.callee.property.value()}")`;
                }
            }
        }

        const callee= this.stack.callee.emiter(syntax);
        if(this.stack.callee.isSuperExpression){
            return `${callee}.call(${["this"].concat(args).join(",")})`;
        }else if(this.stack.callee.isMemberExpression && this.stack.callee.object.isSuperExpression){
            if( this.stack.callee.object.isMemberExpression ){
                return `${callee}.call(${[this.stack.callee.object.emiter(syntax)].concat(args).join(",")})`;
            }
            return `${callee}.call(${["this"].concat(args).join(",")})`;
        }
        if( this.stack.isSyntaxRemoved ){
            if(this.stack.parentStack.isExpressionStatement){
                this.stack.parentStack.isSyntaxRemoved = true;
            }else{
                this.stack.error("the expression is removed.");
            }
        }
        if(desc && desc.isMethodDefinition){
            const modifier =desc.modifier.value();
            const refModule = desc.module;
            if( modifier==="private" && refModule.children.length > 0){
                if( this.stack.callee.isMemberExpression ){
                    return `${callee}.call(${[this.stack.callee.object.emiter(syntax)].concat(args).join(",")})`;
                }
                return `${callee}.call(${["this"].concat(args).join(",")})`;
            }
        }
        return `${callee}(${args.join(",")})`;
    }
}
module.exports = CallExpression;