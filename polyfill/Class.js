/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
*/
const __MODULES__=[];
const privateKey=Symbol("privateKey");
const bindClassKey=Symbol("bindClass");
const _proto = Object.prototype;

function merge(obj, target, isInstance=false, depth=false){
    if(!obj || !target || _proto===obj || obj===Object || obj===Function)return;
    const keys = Object.getOwnPropertyNames(obj);
    if( keys ){
        keys.forEach( key=>{
            if(key==='constructor' || key==='prototype' || key==='__proto__')return;
            if(!target.hasOwnProperty(key) && target[key] !== obj[key]){
                try{
                    const desc = Reflect.getOwnPropertyDescriptor(obj, key);
                    if(desc){  
                        const newDesc = Object.create(desc)
                        newDesc.configurable = true;
                        if(!isInstance){
                            newDesc.enumerable = false;
                        }
                        Object.defineProperty(target,key,newDesc);
                    }
                }catch(e){
                    console.error(e)
                }
            }
        });
    }
    if(depth){
        merge(Reflect.getPrototypeOf(obj), target, isInstance, depth);
    }
}

function getDescriptor(obj, name){
    if( !obj )return null;
    const desc = Reflect.getOwnPropertyDescriptor(obj, name);
    if(desc)return desc;
    if(_proto===obj || obj===Object || obj===Function)return;
    return getDescriptor( Reflect.getPrototypeOf(obj), name);
}
const datasetSymbols = Object.create(null);
const Class={
    key:privateKey,
    bindClassKey,
    modules:__MODULES__,
    require:function(id){
        return __MODULES__[id];
    },
    getKeySymbols(id){
        return datasetSymbols[id] || (datasetSymbols[id] = Symbol('private'));
    },
    getObjectDescriptor(obj, name){
        return getDescriptor(obj, name);
    },
    callSuper(moduleClass, thisArg, args=[]){
        if(!moduleClass)return;
        const description = moduleClass[privateKey];
        const _extends = description.extends && Array.isArray(description.extends) ? description.extends.slice(0) : false;
        if(_extends && _extends.length > 0){
            _extends.forEach( (classTarget)=>{
                if(typeof classTarget ==='function'){
                    const newObject = Reflect.construct(classTarget, args, moduleClass);
                    merge(newObject, thisArg, true, true);
                }else if(typeof classTarget ==='object'){
                    merge(newObject, thisArg, true, true);
                }
            });
        }
    },
    callSuperMethod(moduleClass, thisArg, methodName, args=[]){
        const method = this.fetchSuperMethod(moduleClass, methodName, 'method');
        if(method){
            return method.apply(thisArg, args);
        }else{
            throw new ReferenceError(`'super.${methodName}' method is not exists.`)
        }
    },

    callSuperSetter(moduleClass, thisArg, methodName, value){
        const method = this.fetchSuperMethod(moduleClass, methodName, 'setter');
        if(method){
            return method.call(thisArg, value);
        }else{
            throw new ReferenceError(`'super.${methodName}' setter is not exists.`)
        }
    },

    callSuperGetter(moduleClass, thisArg, methodName){
        const method = this.fetchSuperMethod(moduleClass, methodName, 'getter');
        if(method){
            return method.call(thisArg);
        }else{
            throw new ReferenceError(`'super.${methodName}' getter is not exists.`)
        }
    },

    fetchSuperMethod(moduleClass, methodName, kind='method'){

        if(!moduleClass)return null;
        let description = moduleClass[privateKey];
        let parent = null;
        const parentMethods = [];
        if(description && description.inherit){
            parent = description.inherit[privateKey];
            if(!parent || !parent.members){
                parentMethods.push(description.inherit);
            }
        }

        while(parent && parent.members){
            const desc = parent.members[methodName];
            if(desc && Class.CONSTANT.MODIFIER_PRIVATE !== desc.m ){
                if( desc.d === Class.CONSTANT.PROPERTY_ACCESSOR ){
                    if(desc.set && kind==='setter'){
                        return desc.set
                    }else if(desc.get && kind==='getter'){
                        return desc.get
                    }
                }else if( desc.d === Class.CONSTANT.PROPERTY_FUN){
                    return desc.value
                }
            }
            
            if(parent.inherit){
                const _parent = parent.inherit[privateKey];
                if(!_parent || !_parent.members){
                    parentMethods.push(parent.inherit);
                }else{
                    parent = _parent;
                }
            }else{
                break;
            }
        }

        let _extends = description && description.extends && Array.isArray(description.extends) ? description.extends.slice(0) : [];
        if( !description ){
            _extends.push(moduleClass);
        }else{
            _extends.push( ...parentMethods );
        }

        for(let i=0; i<_extends.length;i++){
            const objectClass =_extends[i];
            const desc = typeof objectClass === "function" ? getDescriptor(objectClass.prototype, methodName) : getDescriptor(objectClass, methodName);
            if( desc ){
                if(desc.set && kind==='setter'){
                    return desc.set
                }else if(desc.get && kind==='getter'){
                    return desc.get
                }else if(typeof desc.value ==='function'){
                    return desc.value
                }
            }
        }

        return null;
    },

    creator:function(id, moduleClass, description){
        if( description ){
            const _extends = description.extends && Array.isArray(description.extends) ? description.extends.slice(0) : false;
            if( description.inherit ){
                let inherit = description.inherit;
                if(inherit[bindClassKey]){
                    inherit = inherit[bindClassKey];
                }
                let isProto = typeof inherit === 'function' ? moduleClass.prototype instanceof inherit : true;
                if(!isProto){
                    Object.defineProperty(moduleClass,'prototype',{value:Object.create(description.inherit.prototype)});
                }
                merge(inherit, moduleClass);
            }else if(_extends && _extends.length>0 ){
                let inheritObject = _extends.shift();
                if(inheritObject[bindClassKey]){
                    inheritObject = inheritObject[bindClassKey];
                }
                if(typeof inheritObject ==='function'){
                    Object.defineProperty(moduleClass,'prototype',{value:Object.create(inheritObject.prototype)});
                }
                merge(inheritObject, moduleClass);
            }

            if( description.methods ){
                Object.defineProperties(moduleClass,description.methods);
            }

            if( description.members ){
                Object.defineProperties(moduleClass.prototype, description.members);
            }

            if(_extends && _extends.length>0){
                _extends.forEach( (object)=>{
                    if(object[bindClassKey]){
                        object = object[bindClassKey];
                    }
                    merge(object, moduleClass);
                    merge(object.prototype, moduleClass.prototype);
                });
            }

            Object.defineProperty(moduleClass,privateKey,{value:description});
            if( !Object.hasOwnProperty.call(moduleClass,'name') ){
                Object.defineProperty(moduleClass,'name',{value:description.name});
            }
            
            Object.defineProperty(moduleClass,'toString',{
                configurable:true,
                value:function toString(){
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
                    configurable:true,
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
        return moduleClass;
    },
    getDescriptor(moduleClass){
        return moduleClass[privateKey];
    },
    getClassByName:function(name){
        var len = __MODULES__.length;
        var index = 0;
        for(;index<len;index++){
            var classModule = __MODULES__[index];
            if(classModule){
                var description = classModule[privateKey];
                if( description ){
                    var key = description.ns ? description.ns+'.'+description.name : description.name;
                    if( key === name){
                        return classModule;
                    }
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