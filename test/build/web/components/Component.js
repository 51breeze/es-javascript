import Event from "./../../core/Event.js";
import Class from "./../../core/Class.js";
import Vue from "vue/dist/vue.js";
import EventDispatcher from "./../../core/EventDispatcher.js";
var key = Symbol('private');
var baseOptions = {
    name:"web.components.Component",
    render(createElement){
        return this.render(createElement);
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

var Component = Vue.extend( baseOptions );
Object.defineProperty( Component, 'name', {value:'web.components.Component'})

function createProperties( classConstructor ){
    var proto = classConstructor.prototype;
    Object.defineProperty( proto, '_init', {value:function _init(){
        this[key].event=new EventDispatcher();
        Vue.prototype._init.call(this,options);
    }});
    Object.defineProperty( proto, key, {value:Object.create(null)});
    Object.defineProperty( proto, 'beforeCreate', {value:function beforeCreate(){}});
    Object.defineProperty( proto, 'created', {value:function created(){}});
    Object.defineProperty( proto, 'beforeMount', {value:function beforeMount(){}});
    Object.defineProperty( proto, 'mounted', {value:function mounted(){}});
    Object.defineProperty( proto, 'beforeUpdate', {value:function beforeUpdate(){}});
    Object.defineProperty( proto, 'updated', {value:function updated(){}});
    Object.defineProperty( proto, 'beforeDestroy', {value:function beforeDestroy(){}});
    Object.defineProperty( proto, 'activated', {value:function activated(){}});
    Object.defineProperty( proto, 'destroyed', {value:function destroyed(){}});
    Object.defineProperty( proto, 'errorCaptured', {value:function errorCaptured(){}});
    Object.defineProperty( proto, 'deactivated', {value:function deactivated(){}});
    Object.defineProperty( proto, 'render', {value:function render(){}});
    Object.defineProperty( proto, 'data', {value:function data(){
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

    Object.defineProperty( proto, 'mount', {value:function mount(){
        this.$mount( element );
    }});

    Object.defineProperty( proto, 'slot', {value:function slot(name){
        name = name || 'default';
        return this.$slots[name];
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
}

createProperties(Component);
Class.property(Component,'inherit',function(componentClass){
    if( !componentClass.prototype[key] ){
        return createProperties( Vue.extend(componentClass) );
    }
    return componentClass;
});
Class.creator(7,Component,{
	'id':1,
	'global':true,
	'dynamic':false,
	'name':'Component'
});
export default Component;