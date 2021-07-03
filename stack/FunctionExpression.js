const Syntax = require("../core/Syntax");
const Constant = require("../core/Constant");
class FunctionExpression extends Syntax{
    emitter(){
        const insertBefore = [];
        this.stack.removeAllListeners("insertBefore")
        this.stack.addListener("insertBefore",(content)=>{
            if( content ){
                insertBefore.push(content);
            }
        });

        if( !this.scope.isArrow ){
            this.stack.once("insertThisName",(name)=>{
                insertBefore.push( this.semicolon(`\tvar ${name} = this`) )
            });
        }
        this.createDataByStack(this.stack).awaitCount = 0;
        const body = this.make(this.stack.body);
        const isSupport = false;
        const len = this.stack.params.length;
        const rest = len > 0 && this.stack.params[ len-1 ].isRestElement ?  this.stack.params[ len-1 ] : null;
        const paramItems = rest ? this.stack.params.slice(0,-1) : this.stack.params;
        const before = [];
        const params = paramItems.map( item=>{
            const expre = this.make(item);
            if( isSupport ){
                return expre;
            }
            const name = item.value();
            if( item.right ){
                const defauleValue = this.make(item.right);
                before.push( this.semicolon( `\t${name} = ${name} === void 0 ? ${defauleValue} : ${name}` ) );
            }
            return name;
        });

        //const returnType = this.stack.returnType ? this.stack.returnType.value(syntax) : null;
        const key = this.stack.isConstructor ? this.module.id : (this.stack.key ? this.stack.key.value() : null);
        if( rest ){
            before.push( this.semicolon(`\tvar ${rest.value()} = Array.prototype.slice.call(arguments,${len-1})`) );
        }

        const config = this.getConfig();
        const endIndent = this.getIndent();
        const startIndent = this.stack.parentStack.isBlockStatement ? endIndent : '';

        if( this.stack.async ){
            const name = key ? ` ${key}` : '';
            const returnItem = this.scope.returnItems.length < 1 ? this.semicolon(`${this.getIndent(3)}return [2]`) : '';
            const hand = this.generatorVarName(this.stack,"_a",true);
            const systemRefs = this.checkRefsName("System");
            const expression = [
                `${startIndent}function${config.pure?'':name}(${params.join(",")}){`,
                before.join("\r\n"),
                `${startIndent}${this.getIndent(2)}return ${systemRefs}.awaiter(this, void 0, void 0, function (){`,
                insertBefore.join("\r\n"),
                `${startIndent}${this.getIndent(3)}return ${systemRefs}.generator(this, function (${hand}) {`
            ];
            const end = `${endIndent}${this.getIndent(3)}});\r\n${endIndent}${this.getIndent(2)}});\r\n${endIndent}}`;
            if( this.createDataByStack(this.stack).awaitCount > 0 ){
                expression.push(`${startIndent}${this.getIndent(4)}switch (${hand}.label){`);
                expression.push(`${startIndent}${this.getIndent(5)}case 0 :`);
                expression.push(body);
                expression.push(returnItem);
                expression.push(`${startIndent}${this.getIndent(4)}}`);
                expression.push(end);
            }else{
                expression.push(body);
                expression.push(returnItem);
                expression.push(end);
            }
            return expression.join("\r\n");
        }

        if( this.stack.isArrowFunctionExpression && this.stack.scope.isExpression ){
            const content = before.concat(insertBefore.splice(0), this.semicolon(`${this.getIndent(1)}return ${body}`) ).join("\r\n");
            return `${startIndent}function(${params.join(",")}){\r\n${content}\r\n${endIndent}}`;
        }else{
            const content = before.concat(insertBefore.splice(0),body);
            if( this.stack.isConstructor ){
                const event={properties:null};
                this.stack.parentStack.dispatcher("fetchClassProperty",event);
                if( event.properties ){
                    content.unshift(this.semicolon(`\tObject.defineProperty(this,${this.checkRefsName(Constant.REFS_DECLARE_PRIVATE_NAME)},{value:${event.properties}})`));
                }
            }
            if( (key && !config.pure) || this.stack.isConstructor || this.stack.isFunctionDeclaration ){
                return `${startIndent}function ${key}(${params.join(",")}){\r\n${content.join("\r\n")}\r\n${endIndent}}`;
            }
            return `${startIndent}function(${params.join(",")}){\r\n${content.join("\r\n")}\r\n${endIndent}}`;
        }
    }

}

module.exports = FunctionExpression;