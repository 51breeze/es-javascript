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
            gen.withString( this.checkRefsName("Reflect") );
            gen.withDot();
            gen.withString(`set`);
            gen.withParenthesL();
            gen.withString(module.id);
            gen.withComma();
            this.left.object.make( gen );
            gen.withComma();
            this.left.property.make( gen );
            gen.withComma();
            this.right.make( gen );
            gen.withParenthesR();
        }else if( desc && isMember && stack.left.object.isSuperExpression ){
            this.left.make( gen );
            gen.withDot();
            gen.withString('call');
            gen.withParenthesL();
            gen.withString('this');
            gen.withComma();
            this.right.make( gen );
            gen.withParenthesR();
        }else{
            this.left.make( gen );
            gen.withOperator('=');
            this.right.make( gen );
        }

    }
}
module.exports = AssignmentExpression;