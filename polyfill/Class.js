/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
*/

var __MODULES__=[];
var privateKey=Symbol("privateKey");
var Class={
    key:privateKey,
    modules:__MODULES__,
    require:function(id){
        return __MODULES__[id];
    },
    creator:function(id,moduleClass,description){
        if( description ){
            if( description.inherit ){
                Object.defineProperty(moduleClass,'prototype',{value:Object.create(description.inherit.prototype)});
            }
            if( description.methods ){
                Object.defineProperties(moduleClass,description.methods);
            }
            if( description.members ){
                Object.defineProperties(moduleClass.prototype,description.members);
            }
            Object.defineProperty(moduleClass,privateKey,{value:description});
            Object.defineProperty(moduleClass,'name',{value:description.name});
            Object.defineProperty(moduleClass,'toString',{value:function toString(){
                var name = description.ns ? description.ns+'.'+description.name : description.name;
                var id = description.id;
                if(id === 3){
                    return '[Enum '+name+']';
                }else if(id ===2){
                    return '[Interface '+name+']';
                }else {
                    return '[Class '+name+']';
                }
            }});
            
            if( moduleClass.prototype && !Object.prototype.hasOwnProperty.call(moduleClass.prototype,'toString') ){
                Object.defineProperty(moduleClass.prototype,'toString',{
                    configurable:false,
                    value:function toString(){
                    var name = description.ns ? description.ns+'.'+description.name : description.name;
                    return '[object '+name+']';
                }});
            }
        }
        Object.defineProperty(moduleClass.prototype,'constructor',{value:moduleClass});
        if( id >= 0 ){
            __MODULES__[id] = moduleClass;
        }
    },
    getClassByName:function(name){
        var len = __MODULES__.length;
        var index = 0;
        for(;index<len;index++){
            var classModule = __MODULES__[index];
            var description = classModule[privateKey];
            if( description ){
                var key = description.ns ? description.ns+'.'+description.name : description.name;
                if( key === name){
                    return classModule;
                }
            }
        }
        return null;
    }
};

Class.CONSTANT ={
    MODIFIER_PUBLIC:3,
    MODIFIER_PROTECTED:2,
    MODIFIER_PRIVATE:1,
    MODULE_CLASS:1,
    MODULE_INTERFACE:2,
    MODULE_ENUM:3,
    PROPERTY_VAR:1,
    PROPERTY_CONST:2,
    PROPERTY_FUN:3,
    PROPERTY_ACCESSOR:4,
    PROPERTY_ENUM_KEY:5,
    PROPERTY_ENUM_VALUE:6,
}