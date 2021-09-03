const Syntax = require("../core/Syntax");
class AnnotationExpression extends Syntax{
    emitter(){
        const args = this.stack.getArguments();
        const name = this.stack.name;
        switch( name ){
            case 'Provider' : 
                const indexMap=['className','action','method']
                const getItem=(name)=>{
                    let index = args.findIndex(item=>item.key === name);
                    if( index < 0 ){
                        index = indexMap.indexOf(name);
                    }
                    return args[index];
                }
                const moduleClass = getItem( indexMap[0] );
                const action = getItem( indexMap[1] );
                const method = getItem( indexMap[2] ) || 'Get';
                const providerModule = this.stack.getModuleById(moduleClass.value , true);
                if( !providerModule ){
                    this.error(`Class '${moduleClass.value}' is not exists.`);
                }
                const member = providerModule.getMember(action);
                if( !member || (member.modifier && member.modifier.value() !=="public") ){
                    this.error(`Method '${moduleClass.value}::${action}' is not exists.`);
                }
                const annotation = member.annotations.find( item=>method == item.name );
                if( !annotation ){
                    this.error(`Router '${method}' method is not exists. in ${moduleClass.value}::${action}`);
                }
                this.compilation.setPolicy(2, providerModule);
                return annotation.value;
            default :
                this.error( `The '${name}' annotations is not supported.` );
        }
        return null;
    }
}
module.exports = AnnotationExpression;