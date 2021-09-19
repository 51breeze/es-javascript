const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class EnumDeclaration extends Syntax{
    objectExpression(properties){
        return `{${properties.join(",")}}`;
    }
    objectMerge(props){
        let object = props.shift();
        while( props.length > 0 ){
            let prop = props.shift();
            object = `Object.assign(${object},${prop})`;
        }
        return object;
    }

    makeEnum(){
        const module = this.module;
        const inherit = this.getInherit(module);
        const content = [];
        const refs = [];
        const description = [
            `id:${Constant.DECLARE_ENUM}`,
            `ns:"${module.namespace.toString()}"`,
            `name:"${module.id}"`
        ];
        if( inherit ){
            description.push(`inherit:${inherit.id}`);
        }

        const memberContent = [];
        const emitter=(target,proto,content)=>{
            for( var name in target ){
                const item = target[ name ];
                const value = this.make(item);
                content.push(this.definePropertyDescription(proto,`${name}`,value,false,"public", Constant.DECLARE_PROPERTY_ENUM_VALUE,false));
                content.push(this.definePropertyDescription(proto,value,`"${name}"`,false,"public", Constant.DECLARE_PROPERTY_ENUM_KEY,true));
            }
        }
        emitter( module.methods, "methods", memberContent );

        if( memberContent.length > 0 ){
            content.push(`const methods = {};`);
            description.push(`methods:methods`);
            content.push( memberContent.join("\r\n") );
        }
        
        this.createDependencies(module,refs);

        const construct = `function ${module.id}(){}`;
        const parts = refs.concat(construct,content);
        parts.push(this.emitCreateClassDescription(module, description));
        parts.push( this.emitExportClass(module) );
        return parts.join("\r\n");
    }

    emitter(){
        if( this.stack.parentStack.isPackageDeclaration ){
            return this.makeEnum();
        }
        const name = this.stack.value();
        const properties = this.stack.properties.map( item=>{
            const key = item.value();
            const value = this.make(item.init);
            return `${name}[${name}["${key}"]=${value}]="${key}"`;
        });
        properties.unshift(`${name}={}`);
        properties.push(name);
        return this.semicolon(`var ${name} = (${properties.join(",")})`);
    }
}

module.exports = EnumDeclaration;