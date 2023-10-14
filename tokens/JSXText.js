module.exports = function(ctx, stack){
    let value = stack.value();
    if( value ){  
        value = value.replace(/\s+/g,' ').replace(/(\u0022|\u0027)/g,'\\$1');
        if( value ){
            if(ctx.isRawJsx()){
                return ctx.createIdentifierNode(value, stack);
            }
            return ctx.createLiteralNode(value);
        }
    }
    return null;
}
