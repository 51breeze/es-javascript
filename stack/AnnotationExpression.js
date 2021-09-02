const Syntax = require("../core/Syntax");
class AnnotationExpression extends Syntax{
    emitter(){
        const args = this.stack.getArguments();
        const indexMap=['module','action','method']
        const getItem=(name)=>{
            let index = args.findIndex(item=>item.key === name);
            if( index < 0 ){
                index = indexMap.indexOf(name);
            }
            return args[index];
        }
        const moduleClass = getItem( indexMap[0] );
        const action = getItem( indexMap[1] );
        const method = getItem( indexMap[2] ) || 'get';
        switch( this.stack.name ){
            case 'Provider' : 
                const providerModule = this.stack.getModuleById( moduleClass.value , true);
                if( !providerModule ){
                    this.error(`Class '${moduleClass.value}' is not exists.`);
                }
                const member = providerModule.getMember(action);
                if( !member || (member.modifier && member.modifier.value() !=="public") ){
                    this.error(`Method '${moduleClass.value}::${action}' is not exists.`);
                }
                const allow = ['Post','Get','Put','Option']
                const annotation = member.annotations.find( item=>allow.includes(item.name) );
                if( !annotation ){
                    this.error(`Router '${moduleClass.value}::${action}' is not exists.`);
                }
        }
        return null;
    }
}
module.exports = AnnotationExpression;