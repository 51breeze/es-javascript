const Token = require("../core/Token");
const Constant = require("../core/Constant");
class PropertyDefinition extends Token{

    createChildren(stack){
        this.key = this.createToken(stack.id);
        this.value = this.createToken(stack.init);
        this.modifier = stack.compiler.callUtils('getModifierValue', stack);
        this.static = !!stack.static;
        if( !this.static && modifier==='private' ){
            const property = this.createToken('Property',true);
            property.key = this.key;
            property.init = this.value;
            this.parent.privateProperties.push( property );
        }
        this.kind = stack.kind ==="var" ?  Constant.DECLARE_PROPERTY_VAR : Constant.DECLARE_PROPERTY_CONST;
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