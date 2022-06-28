const Token = require('./Token');
class Creator{
    static createNode(type, stack){
        const obj = new Token(type);
        obj.stack = stack;
        obj.scope = flag ? this.scope : stack.scope;
        obj.compilation = flag ? this.compilation : stack.compilation;
        obj.compiler = flag ? this.compiler : stack.compiler;
        obj.module = flag ? this.module : stack.module;
        obj.plugin = plugin;
        obj.name = this.name;
        obj.platform = this.platform;
        obj.parent = this;
        obj.builder = this.builder;
    }
}