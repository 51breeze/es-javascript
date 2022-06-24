module.exports = function(stack,ctx){
    const desc = stack.description();
    const module =  this.getModule();
    const isMember = stack.left.isMemberExpression;
    var isReflect = false;
    if( isMember ){
        if( stack.left.computed ){
            const hasDynamic = desc && desc.isComputeType && desc.isPropertyExists();
            if( !hasDynamic && !ctx.compiler.callUtils("isLiteralObjectType", stack.left.object.type() ) ){
                isReflect = true;
            }
        }else if( desc && desc.isAnyType ){
            isReflect = !ctx.compiler.callUtils("isLiteralObjectType", stack.left.object.type() )
        }
    }

    this.right = this.createNode( stack.right );
    if(isReflect){
        this.object = this.createNode(stack.left.object);
        this.property = this.createNode(stack.left.property);
    }else{
        this.left = this.createNode( stack.left );
    }

    this.make( stream=>{
        
        if( isReflect ){
            const reflect = ctx.checkRefsName("Reflect");
            ctx.addDepend( ctx.getGlobalTypeById("Reflect") );
            stream.withString(reflect);
            stream.withDot();
            stream.withString(`set`);
            stream.withParenthesL();
            stream.withString(module.id);
            stream.withComma();
            this.object.emit( stream );
            stream.withComma();
            this.property.emit( stream );
            stream.withComma();
            this.right.emit( stream );
            stream.withParenthesR();
        }else if( desc && isMember && stack.left.object.isSuperExpression ){
            this.left.emit( stream );
            stream.withDot();
            stream.withString('call');
            stream.withParenthesL();
            stream.withString('this');
            stream.withComma();
            this.right.emit( stream );
            stream.withParenthesR();
        }else{
            this.left.emit( stream );
            stream.withOperator('=');
            this.right.emit( stream );
        }

    });

}