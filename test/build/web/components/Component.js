import Class from "./../../core/Class.js";
import Vue from "vue/dist/vue.js";
var baseOptions = {
    name:"web.components.Component",
    render(createElement){
        return this.render(createElement);
    },
    beforeCreate(){
        this.beforeCreate()
    },
    created(){
        this.created()
    },
    beforeMount(){
        this.beforeMount()
    },
    mounted(){
        this.mounted()
    },
    beforeUpdate(){
        this.beforeUpdate()
    },
    updated(){
        this.updated()
    },
    beforeDestroy(){
        this.beforeDestroy()
    },
    destroyed(){
        this.destroyed()
    },
    activated(){
        this.activated()
    },
    deactivated(){
        this.activated()
    },
    errorCaptured(){
        this.errorCaptured()
    },
};
var key = Symbol('private');
function Component( options ){
    this[key] = options;
    Vue.call(this, options);
    console.log( this.$options )
}
Component.prototype = Object.create( Vue.prototype ); 
Component.prototype.constructor = Component;
Component.prototype.getReceiveValue=function getReceiveValue(name,defaultValue){
    var options = this[key];
    if( options && options._parentVnode && options._parentVnode.componentOptions ){
        var propsData = options._parentVnode.componentOptions.propsData;
        if( propsData ){
            if( name ){
                return propsData[name] || defaultValue || null;
            }
            return propsData;
        }
    }
    return defaultValue || null;
};
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

        if( name ==="Person" ){
            options.props = ['name']
        }

        var object = Vue.extend(options);
        for( var name in object ){
            if( name !== 'prototype' && object.hasOwnProperty(name) ){
               subClass[name] = object[name];
            }
        }

        // subClass.options=options;
        // subClass.cid = cid++;
        // subClass['super'] = Vue;
        // subClass.superOptions = Vue.options;
        // subClass.extendOptions = options;
        // subClass.sealedOptions = Object.assign({},options);
        subClass.makeComponent = makeComponent;
    };
    return makeComponent;
})();
Class.creator(8,Component,{
	'id':1,
	'global':true,
	'dynamic':false,
	'name':'Component'
});
export default Component;