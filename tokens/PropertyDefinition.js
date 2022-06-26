const Token = require("../core/Token");
class PropertyDefinition extends Token{

    constructor(stack){
        super(stack);
        this.key = this.createToken(stack.id);
        this.value = this.createToken(stack.init);
        this.kind= stack.kind;
        this.modifier = stack.compiler.callUtils('getModifierValue', stack);
    }

    emitter() {
        const annotations = this.stack.annotations || [];
        var embeds = annotations.filter( item=>{
            return item.name.toLowerCase() ==='embed';
        });
        if( embeds.length > 0  ){
            var items = [];
            embeds.forEach( embed=>{
                const args = embed.getArguments();
                args.forEach( item=>{
                    if( item.resolveFile ){
                        const asset = this.module.assets.get( item.resolveFile );
                        if( asset.assign ){
                            items.push( asset.assign )
                        }else{
                            const value = this.getFileRelativePath( this.stack.module.file, item.resolveFile);
                            items.push(`"${value}"`);
                        } 
                    }
                });
            });
            return items.length > 1 ? `[${items.join(',')}]` : `${items[0]}`;
        }
        return this.stack.init ? this.make(this.stack.init) : `null`;
    }
}

module.exports = PropertyDefinition;