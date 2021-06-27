const Syntax = require("../core/Syntax");
const Constant = require("../../core/Constant");
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

    makeEnum(syntax){
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
        const emiter=(target,proto,content)=>{
            for( var name in target ){
                const item = target[ name ];
                const value = item.emiter(syntax);
                content.push(this.definePropertyDescription(proto,`${name}`,value,false,"public", Constant.DECLARE_PROPERTY_ENUM_VALUE,false));
                content.push(this.definePropertyDescription(proto,value,`"${name}"`,false,"public", Constant.DECLARE_PROPERTY_ENUM_KEY,true));
            }
        }
        emiter( module.methods, "methods", memberContent );

        if( memberContent.length > 0 ){
            content.push(`const methods = {};`);
            description.push(`methods:methods`);
            content.push( memberContent.join("\r\n") );
        }
        this.createDependencies(module,refs);

        const construct = `function ${module.id}(){}`;
        const config  = this.getConfig();
        const parts = refs.concat(construct,content);
        parts.push(`System.setClass(${this.getIdByModule(module)},${module.id},${this.getDescription(description)});`);

        if( config.output.mode === Constant.BUILD_OUTPUT_MERGE_FILE ){
            return `/*enum ${module.getName()}*/\r\n(function(System){\r\n\t${parts.join("\r\n").replace(/\r\n/g,'\r\n\t')}\r\n}(System));`;
        }else{
            if( config.module === Constant.BUILD_REFS_MODULE_ES6 ){
                parts.push(`export default ${this.module.id};`)
            }else{
                parts.push(`module.exports=${this.module.id};`)
            }
            return parts.join("\r\n");
        }
    }

    emiter( syntax ){
        if( this.stack.parentStack.isPackageDeclaration ){
            return this.makeEnum(syntax);
        }
        const name = this.stack.value();
        const properties = this.stack.properties.map( item=>{
            const key = item.value(syntax);
            const value = item.init.emiter(syntax);
            return `${name}[${name}["${key}"]=${value}]="${key}"`;
        });
        properties.unshift(`${name}={}`);
        properties.push(name);
        return this.semicolon(`var ${name} = (${properties.join(",")})`);
    }
}

module.exports = EnumDeclaration;