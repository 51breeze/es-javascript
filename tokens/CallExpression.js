module.exports = function(stack,ctx){
    const isMember = stack.callee.isMemberExpression;
    const desc = stack.callee.description();
    if( isMember && desc && desc.isType && desc.isAnyType  ){
        ctx.addDepend( ctx.getGlobalTypeById("Reflect") );
        this.callee= this.createNode(stack.callee.object);
        this.property= this.createToken("Literal", '"'+stack.callee.property.value()+'"', stack.callee.property.node );
    }else{
        this.callee= this.createNode(stack.callee);
    }
    this.arguments = stack.arguments.map( item=>this.createNode(item) );
    if( ctx.compiler.callUtils("isTypeModule", desc) ){
        ctx.addDepend( desc );
    }

    this.make( stream=>{

        const module = this.getModule();
        if( isMember && desc && desc.isType && desc.isAnyType  ){
            stream.withString('Reflect');
            stream.withDot();
            stream.withString('call');
            stream.withParenthesL();
            stream.withString( module.id );
            stream.withComma();
            this.callee.emit( stream );
            stream.withComma();
            this.property.emit( stream );
            if( this.arguments.length > 0 ){
                stream.withComma();
                stream.withBracketL();
                stream.emitSequence( this.arguments );
                stream.withBracketR();
            }
            stream.withParenthesR(); 
            return;
        }
        
        if( stack.callee.isSuperExpression || isMember && stack.callee.object.isSuperExpression ){
            this.callee.emit( stream );
            stream.withDot();
            stream.withString('call');
            stream.withParenthesL();
            if( stack.callee.object.isMemberExpression ){
                this.callee.object.emit( stream );
            }else{
                stream.withString('this');
            }
            if( this.arguments.length > 0 ){
                stream.withComma();
                stream.emitSequence( this.arguments );
            }
            stream.withParenthesR();
            return;
        }
        
        if( desc && desc.isMethodDefinition ){
            const modifier = desc.modifier && desc.modifier.value() || 'public';
            const refModule = desc.module;
            if( modifier==="private" && refModule.children.length > 0){
                this.callee.emit( stream );
                stream.withDot();
                stream.withString('call');
                stream.withParenthesL();
                if( isMember ){
                    this.callee.object.emit( stream );
                }else{
                    stream.withString('this');
                }
                if( this.arguments.length > 0 ){
                    stream.withComma();
                    stream.emitSequence( this.arguments );
                }
                stream.withParenthesR();
                return;
            }
        }

        this.callee.emit( stream )
        stream.withParenthesL();
        if( this.arguments.length > 0 ){
            stream.emitSequence( this.arguments );
        }
        stream.withParenthesR();

    });
}