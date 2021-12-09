var key = Symbol('private');
var baseOptions = {
    name:"web.components.Component",
    render(){
        return this.render();
    },
    beforeCreate(){
        this.beforeCreate();
    },
    beforeMount(){
        this.beforeMount();
    },
    beforeUpdate(){
        this.beforeUpdate();
    },
    beforeDestroy(){
        this.beforeDestroy();
    },
    errorCaptured(){
        this.errorCaptured();
    },
    created(){
        this.created();
    },
    mounted(){
        this.mounted();
    },
    updated(){
        this.updated();
    },
    destroyed(){
        this.destroyed();
    },
    activated(){
        this.activated();
    },
    deactivated(){
        this.activated();
    }
};

var Component = Vue.extend( Object.assign({}, baseOptions) );
Object.defineProperty( Component, 'name', {value:'web.components.Component'})

function createProperties( classConstructor , superClass ){
    var proto = classConstructor.prototype;
    var invoke = function(context,name,args){
        if( superClass ){
            var callback = superClass[name];
            if( typeof callback === "function" ){
                if( args ){
                    return callback.apply( context, args );
                }else{
                    return callback.call( context ); 
                } 
            }
        }
        return null;
    }
    Object.defineProperty( proto, '_init', {value:function _init(options){
        this[key].event=new EventDispatcher();
        Vue.prototype._init.call(this,options);
    }});
    Object.defineProperty( proto, key, {value:Object.create(null)});
    Object.defineProperty( proto, 'beforeCreate', {value:function beforeCreate(){
        return invoke(this,'beforeCreate');
    }});
    Object.defineProperty( proto, 'created', {value:function created(){
        return invoke(this,'created');
    }});
    Object.defineProperty( proto, 'beforeMount', {value:function beforeMount(){
        return invoke(this,'beforeMount');
    }});
    Object.defineProperty( proto, 'mounted', {value:function mounted(){
        return invoke(this,'mounted');
    }});
    Object.defineProperty( proto, 'beforeUpdate', {value:function beforeUpdate(){
        return invoke(this,'beforeUpdate');
    }});
    Object.defineProperty( proto, 'updated', {value:function updated(){
        return invoke(this,'updated');
    }});
    Object.defineProperty( proto, 'beforeDestroy', {value:function beforeDestroy(){
        return invoke(this,'beforeDestroy');
    }});
    Object.defineProperty( proto, 'activated', {value:function activated(){
        return invoke(this,'activated');
    }});
    Object.defineProperty( proto, 'destroyed', {value:function destroyed(){
        return invoke(this,'destroyed');
    }});
    Object.defineProperty( proto, 'errorCaptured', {value:function errorCaptured(e){
        return invoke(this,'destroyed',[e]);
    }});
    Object.defineProperty( proto, 'deactivated', {value:function deactivated(){
        return invoke(this,'deactivated');
    }});
    Object.defineProperty( proto, 'render', {value: function render(a){
        return invoke(this,'render',[a||this.$createElement]);
    }});
    Object.defineProperty( proto, 'data', {value:function data(name, value){
        var data = this._data;
        var props = this._props;
        if( name ){
            if( value === void 0 ){
                return data[name] || props[name];
            }else{
                var old = data[name];
                if( old !== value ){
                    data[name] = value;
                    this.$forceUpdate();
                }
                return value;
            }
        }else{
            var _data = Object.assign({}, props);
            for(var key in data){
                if( data[key] !== void 0 ){
                    _data[key] = data[key];
                }
            }
            return _data;
        }
    }});

    Object.defineProperty( proto, 'mount', {value:function mount(element){
        this.$mount( element );
    }});

    Object.defineProperty( proto, 'slot', {value:function slot(name){
        name = name || 'default';
        return this.$slots[name];
    }});

    Object.defineProperty( proto, 'parent', {get:function parent(){
        return this.$parent;
    }});

    Object.defineProperty( proto, 'children', {get:function parent(){
        return this.$children;
    }});

    Object.defineProperty( proto, 'addEventListener', {value:function addEventListener(type, listener){
        this[key].event.addEventListener(type, listener);
    }});
    Object.defineProperty( proto, 'dispatchEvent', {value:function dispatchEvent(event){
        return this[key].event.dispatchEvent(event);
    }});
    Object.defineProperty( proto, 'removeEventListener', {value:function removeEventListener(type, listener){
        this[key].event.addEventListener(type, listener);
    }});
    Object.defineProperty( proto, 'hasEventListener', {value:function hasEventListener(type, listener){
        this[key].event.hasEventListener(type, listener);
    }});
    return classConstructor;
}

createProperties(Component);
Object.defineProperty( Component, 'createComponent', {value:function createComponent(options, inheritComponent){
    if( inheritComponent ){
        var superClass = inheritComponent;
        if(typeof superClass === 'function'){
            if( !(superClass.prototype instanceof Vue) ){
                throw new Error('The specified component is not vue instanced');
            }else if( superClass.prototype && superClass.prototype[key] ){
                return superClass;
            }
        }else if( typeof superClass === 'object' ){
            superClass = Vue.extend(inheritComponent);
        }else{
            return superClass;
        }
        options = Object.assign({}, baseOptions, options || {});
        options.extends = superClass;
        var inheritClass = Vue.extend(options);
        createProperties( inheritClass, superClass.options);
        return inheritClass;
    }
    return Vue.extend( Object.assign({}, baseOptions, options || {}) );
}});