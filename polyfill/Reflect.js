/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<export name='_Reflect' />

const _Reflect = (function(_Reflect){
    const _construct = _Reflect ? _Reflect.construct : function construct(theClass, args, newTarget){
        if( !isFun(theClass) ){
            throw new TypeError('is not class or function');
        }
        switch ( args.length ){
            case 0 :
                return new theClass();
            case 1 :
                return new theClass(args[0]);
            case 2 :
                return new theClass(args[0], args[1]);
            case 3 :
                return new theClass(args[0], args[1], args[2]);
            case 4 :
                return new theClass(args[0], args[1], args[2],args[3]);
            case 5 :
                return new theClass(args[0], args[1], args[2],args[3],args[4]);
            case 6 :
                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5]);
            case 7 :
                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6]);
            case 8 :
                return new theClass(args[0], args[1], args[2],args[3],args[4],args[5],args[6],args[7]);
            default :
                var items = [];
                for(var i=0;i<args.length;i++)items.push(i);
                return Function('f,a', 'return new f(a[' + items.join('],a[') + ']);')(theClass, args);
        }
    };

    const _apply = _Reflect ? _Reflect.apply : function apply(target, thisArgument, argumentsList){
        if( typeof target !== "function" ){
            throw new TypeError('is not function');
        }
        thisArgument = thisArgument === target ? undefined : thisArgument;
        if (argumentsList != null) {
            return target.apply(thisArgument === target ? undefined : thisArgument, argumentsList);
        }
        if (thisArgument != null) {
            return target.call(thisArgument);
        }
        return target();
    };

    const hasOwn = Object.prototype.hasOwnProperty;
    function isFun(target){
        return target && target.constructor === Function
    }

    function isClass(objClass){
        if( !objClass || !objClass.constructor)return false;
        var desc = objClass[ Class.key ];
        if( !desc )return isFun(objClass);
        return desc && desc.id === Reflect.MODULE_CLASS;
    }

    function inContext(context,objClass){
        if(!context)return false;
        if(context===objClass)return true;
        const obj = context[Class.key];
        return obj ? inContext(obj.inherit, objClass) : false;
    }

    function Reflect(){ 
        throw new SyntaxError('Reflect is not constructor.');
    }

    Reflect.MODIFIER_PUBLIC = Class.CONSTANT.MODIFIER_PUBLIC;
    Reflect.MODIFIER_PROTECTED = Class.CONSTANT.MODIFIER_PROTECTED;
    Reflect.MODIFIER_PRIVATE = Class.CONSTANT.MODIFIER_PRIVATE;
    Reflect.MEMBERS_ACCESSOR = Class.CONSTANT.PROPERTY_ACCESSOR;
    Reflect.MEMBERS_PROPERTY = Class.CONSTANT.PROPERTY_VAR;
    Reflect.MEMBERS_READONLY = Class.CONSTANT.PROPERTY_CONST;
    Reflect.MEMBERS_METHODS = Class.CONSTANT.PROPERTY_FUN;
    Reflect.MEMBERS_ENUM_KEY = Class.CONSTANT.PROPERTY_ENUM_KEY;
    Reflect.MEMBERS_ENUM_VALUE = Class.CONSTANT.PROPERTY_ENUM_VALUE;
    Reflect.MODULE_CLASS = Class.CONSTANT.MODULE_CLASS;
    Reflect.MODULE_INTERFACE = Class.CONSTANT.MODULE_INTERFACE;
    Reflect.MODULE_ENUM = Class.CONSTANT.MODULE_ENUM;

    Reflect.apply=function apply(target, thisArgument, argumentsList ){
        if( !isFun(target) ){
            throw new TypeError('target is not function');
        }
        if( !Array.isArray(argumentsList) ){
            argumentsList = argumentsList !== void 0 ? [argumentsList] : [];
        }
        return _apply(target, thisArgument, argumentsList);
    };

    Reflect.call=function call(scope,target,propertyKey,argumentsList,thisArgument){
        if( target == null )throw new ReferenceError('target is null or undefined');
        if( propertyKey==null ){
            return Reflect.apply(target, thisArgument, argumentsList);
        }
        return Reflect.apply( Reflect.get(scope,target,propertyKey), thisArgument||target, argumentsList);    
    };

    Reflect.construct=function construct(target, args, newTarget){
        if( !isClass(target) )throw new TypeError('target is not instantiable object.');
        return _construct(target, args || [], newTarget);
    };

    Reflect.deleteProperty=function deleteProperty(target, propertyKey){
        if( !target || propertyKey==null )return false;
        if( propertyKey==="__proto__")return false;
        if( isClass(target) || isClass(target.constructor) ){
            return false;
        }
        if( propertyKey in target ){
            return (delete target[propertyKey]);
        }
        return false;
    };

    Reflect.has=function has(target, propertyKey){
        if( propertyKey==null || target == null )return false;
        if( propertyKey==="__proto__")return false;
        if( isClass(target) || isClass(target.constructor) ) {
            return false;
        }
        return propertyKey in target;
    };


    Reflect.get=function get(scope,target,propertyKey,receiver){
        if( propertyKey===null ||  propertyKey === void 0)return target;
        if( propertyKey === '__proto__' )return null;
        if( target == null )throw new ReferenceError('target is null or undefined');

        const desc = Reflect.getDescriptor(target, propertyKey);
        if( !desc ){
            return null;
        }

        receiver = !receiver && typeof target ==="object" ? target : null;
        if(typeof receiver !=="object" ){
            throw new ReferenceError(`Assignment receiver can only is an object.`);
        }

        let result = null;
        if( !desc.class ){
            if(desc.get){
                result = desc.get.call(receiver);
            }else{
                result = desc.value;
            }
        }else if( !desc.isMember ){
            throw new ReferenceError(`target.${propertyKey} is not exists`);
        }else if( (desc.modifier === Reflect.MODIFIER_PRIVATE && desc.class !== scope) || (desc.modifier === Reflect.MODIFIER_PROTECTED && !inContext(scope, desc.class)) ){
            throw new ReferenceError(`target.${propertyKey} inaccessible`);
        }else{
            if( desc.type === Reflect.MEMBERS_ACCESSOR ){
                if( !desc.get ){
                    throw new ReferenceError(`target.${propertyKey} getter is not exists.`);
                }else{
                    result = desc.get.call(receiver);
                }
            }else if( desc.type === Reflect.MEMBERS_METHODS ){
                result = desc.method;
            }else{
                result = desc.value;
            }
        }
        
        return result === void 0 ? null : result;
    };

    Reflect.set=function(scope,target,propertyKey,value,receiver){
        if( target == null || propertyKey===null ||  propertyKey === void 0 ){
            throw new ReferenceError('target or propertyKey is null or undefined');
        }

        if( propertyKey === '__proto__' )return null;
        const desc = Reflect.getDescriptor(target, propertyKey);

        if( !desc ){
            const objClass = Reflect.getDescriptor(target);
            if(objClass){
                if( objClass.dynamic ){
                    return target[propertyKey] = value; 
                }else{
                    throw new ReferenceError(`target.${propertyKey} is not exists.`);
                }
            }else{
                return target[propertyKey] = value;
            }
        }

        receiver = !receiver && typeof target ==="object" ? target : null;
        if(typeof receiver !=="object" ){
            throw new ReferenceError(`Assignment receiver can only is an object.`);
        }

        if( !desc.class ){
            if( (desc.get && !desc.set) || !desc.writable ){
                throw new ReferenceError(`target.${propertyKey} is readonly.`);
            }else if(desc.set){
                desc.set.call(receiver,value);
            }else{
                target[propertyKey] = value;
            }
        }else if( !desc.isMember ){
            throw new ReferenceError(`target.${propertyKey} is not exists`);
        }else if( (desc.modifier === Reflect.MODIFIER_PRIVATE && desc.class !== scope) || (desc.modifier === Reflect.MODIFIER_PROTECTED && !inContext(scope, desc.class)) ){
            throw new ReferenceError(`target.${propertyKey} inaccessible`);
        }else{
            if( desc.type === Reflect.MEMBERS_ACCESSOR ){
                if( !desc.set ){
                    throw new ReferenceError(`target.${propertyKey} setter is not exists.`);
                }else{
                    desc.set.call(receiver, value);
                }
            }else if( desc.type === Reflect.MEMBERS_METHODS || !desc.writable ){
                throw new ReferenceError(`target.${propertyKey} is readonly.`);
            }else{
                let object = target;
                if( desc.modifier === Reflect.MODIFIER_PRIVATE ){
                    object = target[desc.privateKey];
                }
                if( object ){
                    object[propertyKey] = value;
                }
            }
        }
        return value;
    };

    Reflect.incre=function incre(scope,target,propertyKey,flag){
        const val = Reflect.get(scope,target,propertyKey);
        const result = val+1;
        Reflect.set(scope,target, propertyKey, result);
        return flag === true ? val : result;
    }

    Reflect.decre= function decre(scope,target, propertyKey,flag){
        const val = Reflect.get(scope,target, propertyKey);
        const result = val-1;
        Reflect.set(scope,target, propertyKey,result);
        return flag === true ? val : result;
    }

    Reflect.getDescriptor=function getDescriptor(target,name){

        if(target===null||target === void 0)return false;
        target = Object(target);
        let objClass = target;
        let description = target[ Class.key ];
        let isStatic = true;
        if( !description && target.constructor ){
            isStatic = false;
            objClass = target.constructor;
            description = target.constructor[ Class.key ]
        }

        if( !description ){
            let result = null;
            if( name ){
                try{
                    result = Object.getOwnPropertyDescriptor(target, name);
                    if( !result && name in target){
                        const configurable = hasOwn.call(target, name);
                        result = {
                            value:target[name],
                            writable:configurable,
                            configurable:configurable,
                            enumerable:configurable
                        }
                    }
                }catch(e){}
            }
            return result;
        }

        if( !name ){
            let d = description;
            return {
                'isModule':true,
                'type':d.id,
                'class':objClass,
                'className':d.name,
                'namespace':d.ns || null,
                'dynamic':!!d.dynamic,
                'isStatic':!!d.static,
                'privateKey':d.private || null,
                'implements':d.imps || null,
                'members':d.members || null,
                'methods':d.methods || null,
                'inherit':d.inherit || null,
            };
        }

        const privateScope = objClass;
        while( objClass && (description = objClass[ Class.key ]) ){
            let dataset = isStatic ? description.methods : description.members;
            if( dataset && hasOwn.call(dataset,name) ){
                const desc = dataset[name];
                const modifier = desc.m & Reflect.MODIFIER_PUBLIC;
                const item = {
                    'isMember':true,
                    'type':desc.d,
                    'class':objClass,
                    'isStatic':isStatic,
                    'privateKey':null,
                    'modifier':modifier,
                    'enumerable':false,
                    'writable':false,
                    'configurable':false
                };

                if( desc.d === Reflect.MEMBERS_ACCESSOR ){
                    item.label = 'accessor';
                    item.set = null;
                    item.get = null;
                    if(desc.set){
                        item.writable = true;
                        item.set = desc.set;
                    }
                    if(desc.get){
                        item.enumerable = true;
                        item.get = desc.get;
                    }
                }else if( desc.d === Reflect.MEMBERS_METHODS ){
                    item.label = 'method';
                    item.method = desc.value;
                }else{
                    item.label = 'property';
                    item.writable = Reflect.MEMBERS_READONLY !== desc.d;
                    item.enumerable = true;
                    item.value = desc.value || null;
                    if( isStatic ){
                        item.value = target[name] || null;
                    }else{
                        if( item.modifier === Reflect.MODIFIER_PRIVATE ){
                            const objPrivate = target[ description.private ];
                            item.dataset = objPrivate;
                            if(objPrivate && name in objPrivate){
                                item.value = objPrivate[name] || null;
                            }
                        }else{
                            item.value = target[name] || null;
                        }
                    }
                }

                if( item.modifier === Reflect.MODIFIER_PRIVATE ){
                    item.privateKey = description.private;
                    if( privateScope !== objClass ){
                        continue;
                    }
                }
                
                return item;
            }
            objClass = description.inherit;
        }

        return null;
    };

    return Reflect;

}(Reflect));