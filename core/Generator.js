const events = require('events');
class Generator extends events.EventEmitter {
    constructor(type,module,compilation,compiler,scope,stack){
        this._type = type;
        this._module = module;
        this._compilation = compilation;
        this._compiler = compiler;
        this._scope = scope;
        this._stack = stack;
        this._parent = null;
        this._line = 0;
        this._column = 0;
        this._token = null;
        this._plugin = null;
        this._name = null;
        this._platform = null;
    }

    get type(){
        return this._type;
    }
    get module(){
        return this._module;
    }
    get compilation(){
        return this._compilation;
    }
    get compiler(){
        return this._compiler;
    }
    get scope(){
        return this._scope;
    }
    get stack(){
        return this._stack;
    }
    get line(){
        return this._line;
    }
    get column(){
        return this._column;
    }
    get token(){
        return this._token;
    }
    get plugin(){
        return this._plugin;
    }
    get name(){
        return this._name;
    }
    get platform(){
        return this._platform;
    }
    get parent(){
        return this._parent;
    }
    get children(){
        return this._children || (this._children=[]);
    }

    genLine(){
        this._line++;
    }

    genColumn(){
        this._column++;
    }

    genToken(value){
        this._token = value;
        return this;
    }

    createInstanceByStack(stack){
        return new Generator(stack.toString(),stack.module,stack.compilation,stack.compiler,stack.scope,stack);
    }

    createInstanceByType(type){
        return new Generator(type,this.module,this.compilation,this.compiler,this.scope);
    }

    addChild(generatorInstance){
       const children = this.children || (this.children=[]);
       children.push( generatorInstance );
       return gen;
    }

    addChildAt(generatorInstance, index){
        const children = this.children;
        if( index < 0 ){
            index = children.length + index;
        }else if( index > children.length ){
            index = children.length;
        }
        children.splice(index,0,generatorInstance);
        return gen;
    }

    removeChildAt(index){
        const children = this.children;
        if( index < 0 ){
            index = children.length + index;
        }else if( index >= children.length ){
            index = children.length-1;
        }
        return children.splice(index,1);
    }

    toString(){

    }
}

module.exports = Generator;