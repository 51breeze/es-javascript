const Token = require("../core/Token");
const Constant = require("../core/Constant");
class MemberExpression extends Token{
    createChildren(stack){
        this.object = this.createToken(stack.object);
        this.property = this.createToken(stack.property);
    }

    createSuperGetterExpressionToken(){
        const callee = this.createSuperMemberToken('get','call');
        return this.createCalleeToken( callee, [this.createIdentifierToken(null,'ThisExpression')]);
    }

    createSuperMemberToken( ...args ){
        const property = this.createMemberToken([this.checkRefsName('Class'),'key']);
        property.compute = true;
        return this.createMemberToken([this.object, property, 'members', this.property, ...args]);
    }

    make(gen){
        const module = this.module;
        const description = this.getDescription();
        if( !description ){
            this.object.make( gen );
            gen.withDot();
            this.property.make( gen );
            return;
        }

        let isStatic = false;
        if( description && description.isModule && this.compiler.callUtils("isTypeModule",description) ){
            this.addDepend( description );
        }else if( this.compiler.callUtils("isTypeModule",this.stack.object.description()) ){
            isStatic = true;
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
                return this.createCalleeToken(
                    this.createMemberToken([this.checkRefsName("Reflect"),'get']),
                    [this.createIdentifierToken(module.id), this.object, this.property]
                ).make( gen );
            }
        }

        if(description && description.isMethodDefinition){
            const modifier = this.compiler.callUtils('getModifierValue', description);
            const refModule = description.module;
            if(modifier==="private" && refModule.children.length > 0){
                return this.createMemberToken(
                    [this.module.id,'prototype',this.property],
                ).make( gen );
            }
        }
        
        if( this.compiler.callUtils("isClassType", description) ){
            this.addDepend( description );
            return gen.withString( this.getModuleReferenceName(description,module) );
        }
        
        if( this.stack.object.isSuperExpression ){
            if( description && description.isMethodGetterDefinition ){
                return this.createSuperGetterExpressionToken().make( gen );
            }else if(description && description.isMethodSetterDefinition ){
                return this.createSuperMemberToken('set').make( gen );
            }else{
                return this.createMemberToken([this.object,'prototype',this.property]).make( gen );
            }
        }

        if(description && description.isPropertyDefinition && !isStatic && description.modifier && description.modifier.value() === "private"){
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
