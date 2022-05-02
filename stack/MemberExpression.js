const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class MemberExpression extends Syntax{
    emitter(){
        const module = this.module;
        let property = this.stack.property.isIdentifier ? this.stack.property.value() : this.make(this.stack.property);
        const object = this.make(this.stack.object);
        const description = this.stack.description();
        const option = this.getConfig();
        
        if( description && description.isModule && this.compiler.callUtils("isTypeModule",description) ){
            this.addDepend( description );
        }else if( this.compiler.callUtils("isTypeModule",this.stack.object.description()) ){
            this.addDepend( this.stack.object.description() );
        }

        if( description && description.isType && description.isAnyType ){
            let isReflect = false
            const hasDynamic = description.isComputeType && description.isPropertyExists();
            if( !hasDynamic && !this.compiler.callUtils("isLiteralObjectType", this.stack.object.type() ) ){
                isReflect = true;
            }
            if( isReflect ){
                this.addDepend( this.stack.getGlobalTypeById("Reflect") );
                if( this.stack.computed ){
                    return `${this.checkRefsName("Reflect")}.get(${module.id},${object},${property})`;
                }else{
                    return `${this.checkRefsName("Reflect")}.get(${module.id},${object},'${property}')`;
                }
            }
            if( this.stack.computed ){
                return `${object}[${property}]`;
            }
            return `${object}.${property}`;
        }

        if( option.target === "es5" && description && description.isMethodGetterDefinition ){
            const name = this.compiler.callUtils("firstToUpper", property);
            if( this.stack.object.isSuperExpression ){
                return `${object}.get${name}.call(this)`;
            }
            return `${object}.get${name}()`;
        }

        if(description && description.isMethodDefinition){
            const modifier = description.modifier && description.modifier.value() || 'public';
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

        if( description && (!description.isAccessor && description.isMethodDefinition) ){
            const pStack = this.stack.getParentStack( stack=>!!(stack.jsxElement || stack.isBlockStatement || stack.isCallExpression || stack.isExpressionStatement));
            if( pStack && pStack.jsxElement ){
                return `${object}.${property}.bind(this)`;
            }
        }

        return `${object}.${property}`;
    }
}

module.exports = MemberExpression;
