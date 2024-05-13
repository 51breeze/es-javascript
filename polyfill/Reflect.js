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

    function getObjectDescriptor(target, name){
        try{
            if(!target)return null;
            let result = Class.getObjectDescriptor(target, name);
            if(!result && name in target){
                const configurable = hasOwn.call(target, name);
                result = {
                    value:target[name],
                    writable:configurable,
                    configurable:configurable,
                    enumerable:configurable
                }
            }
            if( result ){
                result.key = name;
                result.isDescriptor = true;
                result.isMember = true;
                result.modifier = Reflect.MODIFIER_PUBLIC;
                result.permission = 'public';
                result.type = Reflect.MEMBERS_PROPERTY;
                result.label = 'property';
                if(result.get || result.set){
                    result.type = Reflect.MEMBERS_ACCESSOR;
                    result.label = 'accessor';
                }else if(typeof result.value ==='function' && !result.enumerable && !result.writable){
                    result.type = Reflect.MEMBERS_METHODS;
                    result.label = 'method';
                }
                result.owner = target.prototype && target.prototype.constructor || null;
                return result;
            }
        }catch(e){}
        return null;
    }

    function getModifier(desc){
        switch( desc.m & Reflect.MODIFIER_PUBLIC ){
            case Reflect.MODIFIER_PUBLIC : return 'public';
            case Reflect.MODIFIER_PROTECTED : return 'protected';
            case Reflect.MODIFIER_PRIVATE : return 'private';
        }
        return null;
    }

    function createMemberDescriptor(key, desc, target, ownerClass, privateScope, privateKey, isStatic=false){
        const modifier = desc.m & Reflect.MODIFIER_PUBLIC;
        const item = {
            'isDescriptor':true,
            'isMember':true,
            'key':key,
            'owner':ownerClass,
            'type':desc.d,
            'isStatic':isStatic,
            'privateKey':null,
            'modifier':modifier,
            'permission':getModifier(desc),
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
            item.value = desc.value;
        }else{
            item.label = 'property';
            item.writable = Reflect.MEMBERS_READONLY !== desc.d;
            item.enumerable = true;
            item.value = desc.value || null;
            if(target){
                if( isStatic ){
                    if(key in target)item.value = target[key];
                }else{
                    if(item.modifier === Reflect.MODIFIER_PRIVATE ){
                        const objPrivate = target[privateKey];
                        item.dataset = objPrivate;
                        if(objPrivate && key in objPrivate){
                            item.value = objPrivate[key];
                        }
                    }else if(key in target){
                        item.value = target[key];
                    }
                }
            }
        }
        if( item.modifier === Reflect.MODIFIER_PRIVATE ){
            if( privateScope === ownerClass ){
                item.privateKey = privateKey;
            }
        }
        return item;
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
            if( name != null ){
                result = getObjectDescriptor(target, name);
            }
            return result;
        }

        if( !name ){
            let d = description;
            const make = (obj, isStatic=false)=>{
                if(!obj)return null;
                const dataset = Object.create(null)
                Object.keys(obj).forEach( key=>{
                    const item = createMemberDescriptor(key, obj[key], target, objClass, objClass, description.private, isStatic);
                    dataset[key] = item;
                });
                return dataset;
            }

            let id = description.id;
            let label='class';
            if(id ===3){
                label='enum';
            }else if(id ===2){
                label='interface';
            }

            const members = d.members;
            const methods = d.methods;
            let originMembers = null;
            let originMethods = null;
            if(!members){
                originMembers = Object.create(null);
                Object.getOwnPropertyNames(target).forEach( key=>{
                    if(key==='prototype'||key==='__proto__'||key==='constructor')return;
                    originMembers[key] = getObjectDescriptor(target, key);
                });
            }

            if(!methods){
                originMethods = Object.create(null);
                Object.getOwnPropertyNames(objClass).forEach( key=>{
                    if(key==='prototype'||key==='__proto__'||key==='constructor')return;
                    originMethods[key] = getObjectDescriptor(objClass, key);
                });
            }

            return {
                'isDescriptor':true,
                'isModule':true,
                'type':d.id,
                'label':label,
                'class':objClass,
                'className':d.name,
                'namespace':d.ns || null,
                'dynamic':!!d.dynamic,
                'isStatic':!!d.static,
                'privateKey':d.private || null,
                'implements':d.imps || null,
                'members':originMembers || make(members),
                'methods':originMethods || make(methods, true),
                'inherit':d.inherit || null,
            };
        }

        if(description){
            if(isStatic){
                if(!description.methods){
                    return getObjectDescriptor(objClass, name)
                }
            }else{
                if(!description.members){
                    return getObjectDescriptor(target, name)
                }
            }
        }

        const privateScope = objClass;
        while( objClass && (description = objClass[ Class.key ]) ){
            let dataset = isStatic ? description.methods : description.members;
            if( dataset && hasOwn.call(dataset,name) ){
                const desc = dataset[name];
                const item = createMemberDescriptor(name, desc, target, objClass, privateScope, description.private, isStatic);
                if( item.modifier === Reflect.MODIFIER_PRIVATE ){
                    if( privateScope === objClass ){
                        return item;
                    }
                }else{
                    return item;
                }
            }
            const inheritClass=description.inherit;
            if(inheritClass && inheritClass !== objClass){
                objClass = inheritClass;
            }else{
                break;
            }
        }

        if(objClass && !description){
            return getObjectDescriptor(typeof objClass ==='function' ? objClass.prototype : objClass, name);
        }

        return null;
    };

    Reflect.getDescriptors=function getDescriptors(target, options={}){
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

        let d = description;
        let id = d.id;
        let label='class';
        if(id ===3){
            label='enum';
        }else if(id ===2){
            label='interface';
        }

        const top = {
            'isDescriptor':true,
            'isModule':true,
            'type':id,
            'label':label,
            'class':objClass,
            'className':d.name,
            'namespace':d.ns || null,
            'dynamic':!!d.dynamic,
            'isStatic':!!d.static,
            'privateKey':d.private || null,
            'implements':d.imps || null,
            'inherit':d.inherit || null,
            'descriptors':[],
        };

        const fetchValue = options.fetchValue !== false;
        const defaultMode = 1;
        const mode = Math.max(Math.min(options.mode || defaultMode, 3), defaultMode);
        const parentClass = options.parentClass;
        const descriptors = top.descriptors;
        const make = (obj, isStatic=false)=>{
            if(!obj)return null;
            const dataset = Object.create(null)
            Object.keys(obj).forEach( key=>{
                const item = createMemberDescriptor(key, obj[key], fetchValue ? target : null, objClass, objClass, description.private, isStatic);
                descriptors.push(item);
            });
            return dataset;
        }
        
        while( objClass && (description = objClass[ Class.key ]) ){
            if(parentClass === objClass)break;
            if(mode & 1 === 1)make(description.members);
            if(mode & 2 === 2)make(description.methods, true);
            const inheritClass=description.inherit;
            if(inheritClass && inheritClass !== objClass){
                objClass = inheritClass;
            }else{
                break;
            }
        }

        if(descriptors.length ===0){

            Object.getOwnPropertyNames(target).forEach( key=>{
                if(key==='prototype'||key==='__proto__'||key==='constructor')return;
                descriptors.push(getObjectDescriptor(target, key));
            });

            Object.getOwnPropertyNames(objClass).forEach( key=>{
                if(key==='prototype'||key==='__proto__'||key==='constructor')return;
                originMethods[key] = getObjectDescriptor(objClass, key);
            });
        }
        
        return top;
    }

    return Reflect;

}(Reflect));