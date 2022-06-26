const Token = require("../core/Token");
class AssignmentExpression extends Token{

    createChildren(stack){
        this.left = this.createToken( stack.left );
        this.right = this.createToken( stack.right );
    }

    make(gen){
        const desc = this.stack.description();
        const module =  this.module;
        const isMember = this.stack.left.isMemberExpression;
        var isReflect = false;
        if( isMember ){
            if( this.stack.left.computed ){
                const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
                if( !hasDynamic && !this.compiler.callUtils("isLiteralObjectType", stack.left.object.type() ) ){
                    isReflect = true;
                }
            }else if( desc && desc.isAnyType ){
                isReflect = !this.compiler.callUtils("isLiteralObjectType", stack.left.object.type() )
            }
        }

        if( isReflect ){
            this.addDepend( this.getGlobalTypeById("Reflect") );
            return this.createCalleeToken(
                this.createMemberToken(['Reflect','set']),
                [
                    this.createIdentifierToken( module.id ),
                    this.left.object,
                    this.left.property,
                    this.right
                ]
            ).make( gen );
        }else if( desc && isMember && stack.left.object.isSuperExpression ){
            return this.createCalleeToken(
                this.createMemberToken([this.left,'call']),
                [
                    this.createIdentifierToken( null, 'ThisExpression' ),
                    this.right
                ]
           ).make( gen );
        }else{
            this.left.make( gen );
            gen.withOperator('=');
            this.right.make( gen );
        }

    }
}
module.exports = AssignmentExpression;