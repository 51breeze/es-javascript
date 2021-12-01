var key = Symbol('private');
var baseOptions = {
    name:"web.components.Component",
    render(createElement){
        return this.render.call(this._self,createElement);
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
function Component( options ){
    this[key] = {'options':options,'event':new EventDispatcher()};
    Vue.call(this, options);
}
Component.prototype = Object.create( Vue.prototype ); 
Component.prototype.constructor = Component;
Component.prototype.beforeCreate=function beforeCreate(){};
Component.prototype.created=function created(){};
Component.prototype.beforeMount=function beforeMount(){};
Component.prototype.mounted=function mounted(){};
Component.prototype.beforeUpdate=function beforeUpdate(){};
Component.prototype.updated=function updated(){};
Component.prototype.beforeDestroy=function beforeDestroy(){};
Component.prototype.destroyed=function destroyed(){};
Component.prototype.activated=function activated(){};
Component.prototype.errorCaptured=function errorCaptured(){};
Component.prototype.deactivated=function deactivated(){};
Component.prototype.render=function render(createElement){
    return createElement('div');
};
Component.prototype.data=function data(name,value){
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
};

Component.prototype.mount=function(element){
    this.$mount( element );
}

Component.prototype.slot=function(name){
    name = name || 'default';
    return this.$slots[name];
}

Component.prototype.addEventListener=function addEventListener(type, listener){
    this[key].event.addEventListener(type, listener);
}
Component.prototype.dispatchEvent=function dispatchEvent(event){
    return this[key].event.dispatchEvent(event);
}
Component.prototype.removeEventListener=function removeEventListener(type, listener){
    this[key].event.addEventListener(type, listener);
}
Component.prototype.hasEventListener=function hasEventListener(type, listener){
    this[key].event.hasEventListener(type, listener);
}

Component.makeComponent = (function(){
    var cid = ++Vue.cid;
    function makeComponent(name, subClass, options){
        options = Object.assign({}, baseOptions, options );
        options.name = name;
        if( options.data ){
            var _data = options.data;
            options.data = function data(){
                return _data;
            }
        }

        var object = Vue.extend(options);
        for( var name in object ){
            if( name !== 'prototype' && object.hasOwnProperty(name) ){
               subClass[name] = object[name];
            }
        }

        subClass.makeComponent = makeComponent;
    };
    return makeComponent;
})();