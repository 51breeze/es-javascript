class Generator{
    constructor(type,parent){
        this.type = type;
        this.parent = parent;
        this.line = 0;
        this.column = 0;
        this.token = null;
        this.result = {};
    }

    get children(){
        return this._children || (this._children=[]);
    }

    genLine(){
        this.line++;
    }

    genColumn(){
        this.column++;
    }

    addChild( stack ){
       const gen = new Generator(stack, this);
       const children = this.children || (this.children=[]);
       children.push( gen );
       return gen;
    }

    addChildAt( stack , index){
        const gen = new Generator(stack , this);
        const children = this.children;
        if( index < 0 ){
            index = children.length + index;
        }else if( index > children.length ){
            index = children.length;
        }
        children.splice(index,0,gen);
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