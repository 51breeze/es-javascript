/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<references from='System' />
///<export name='_Reflect' />

var _Reflect = (function(_Reflect){
    var _construct = _Reflect ? _Reflect.construct : function construct(theClass,args){
        if( !System.isFunction( theClass ) ){
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
                return Function('f,a', 'return new f(a[' + System.range(0, args.length).join('],a[') + ']);')(theClass, args);
        }
    };

    var _apply = _Reflect ? _Reflect.apply : function apply(target, thisArgument, argumentsList){
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

    var MODIFIER_PUBLIC=3;
    var MODIFIER_PROTECTED=2;
    var MODIFIER_PRIVATE=1;

    function inContext(context,objClass){
        if( !System.isClass(objClass) )return;
        var inherit = context[ Class.key ].inherit;
        if( inherit === objClass ){
            return true;
        }
        return inContext(inherit, objClass);
    }

    function description(scope,target,name){
        var isStatic = System.isClass(target);
        var objClass = isStatic ? target : target.constructor;
        var context = System.isClass(scope) ? scope : null;
        var description = objClass[ Class.key ];
        if( !isStatic && !System.isClass(objClass) ){
            return target;
        }
        var isDynamic = description && description.dynamic;
        while( objClass && (description = objClass[ Class.key ]) ){
            var dataset = isStatic ? description.methods : description.members;
            if( dataset && dataset.hasOwnProperty( name ) ){
                const desc = dataset[name];
                switch( desc.m & MODIFIER_PUBLIC ){
                    case MODIFIER_PRIVATE :
                        return  context === objClass ? desc : false;
                    case MODIFIER_PROTECTED :
                        return context && inContext(context,objClass) ? desc : false;
                    default :
                        return desc;
                }
            }
            objClass = description.inherit;
        }
        if( isDynamic ){
            return target;
        }
        if( Object.prototype.hasOwnProperty(name) ){
            return {value:Object.prototype[name]};
        }
        return null;
    };

    function Reflect(){ 
        throw new SyntaxError('Reflect is not constructor.');
    }

    Reflect.apply=function apply(target, thisArgument, argumentsList ){
        if( !System.isFunction( target ) ){
            throw new TypeError('target is not function');
        }
        if( !System.isArray(argumentsList) ){
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

    Reflect.construct=function construct(target, args){
        if( !System.isClass(target) )throw new TypeError('target is not class');
        return _construct(target, args || []);
    };

    Reflect.deleteProperty=function deleteProperty(target, propertyKey){
        if( !target || propertyKey==null )return false;
        if( propertyKey==="__proto__")return false;
        if( System.isClass(target) || System.isClass(target.constructor) ){
            return false;
        }
        if( Object.prototype.hasOwnProperty( target, propertyKey) ){
            return (delete target[propertyKey]);
        }
        return false;
    };

    Reflect.has=function has(target, propertyKey){
        if( propertyKey==null || target == null )return false;
        if( propertyKey==="__proto__")return false;
        if( System.isClass(target) || System.isClass(target.constructor) ) {
            return false;
        }
        return propertyKey in target;
    };

    var DECLARE_PROPERTY_ACCESSOR = 4;
    Reflect.get=function get(scope,target,propertyKey,receiver){
        if( propertyKey==null )return target;
        if( propertyKey === '__proto__' )return null;
        if( target == null )throw new ReferenceError('target is null or undefined');
        var desc = description(scope,target,propertyKey);
        if( desc === target ){
            return target[propertyKey] || null;
        }
        if( desc === false ){
            throw new ReferenceError(`target.${propertyKey} inaccessible`);
        }
        if( !desc ){
            throw new ReferenceError(`target.${propertyKey} is not exists`);
        }
        receiver = !receiver && typeof target ==="object" ? target : null;
        if(typeof receiver !=="object" ){
            throw new ReferenceError(`Assignment receiver can only is an object.`);
        }
        if( desc.d === DECLARE_PROPERTY_ACCESSOR ){
            if( !desc.get ){
                throw new ReferenceError(`target.${propertyKey} getter is not exists.`);
            }
            return desc.get.call(receiver);
        }
        return desc.value || null;
    };

    var DECLARE_PROPERTY_ACCESSOR = 4;
    var DECLARE_PROPERTY_VAR = 1;

    Reflect.set=function(scope,target,propertyKey,value,receiver){
        if( propertyKey==null )return target;
        if( propertyKey === '__proto__' )return null;
        if( target == null )throw new ReferenceError('target is null or undefined');
        var desc = description(scope,target,propertyKey);
        if( desc === target ){
            return target[propertyKey] = value;
        }
        if( desc === false ){
            throw new ReferenceError(`target.${propertyKey} inaccessible`);
        }
        if( !desc ){
            throw new ReferenceError(`target.${propertyKey} is not exists.`);
        }
        receiver = !receiver && typeof target ==="object" ? target : null;
        if(typeof receiver !=="object" ){
            throw new ReferenceError(`Assignment receiver can only is an object.`);
        }
        if( desc.d === DECLARE_PROPERTY_ACCESSOR ){
            if( !desc.set ){
                throw new ReferenceError(`target.${propertyKey} setter is not exists.`);
            }
            desc.set.call(receiver);
        }else if( desc.d === DECLARE_PROPERTY_VAR ){
            if( System.isClass(target) ){
                target[propertyKey] = value;
            }else if( System.isClass(target.constructor) ){
                var p = target.constructor[Class.key]._private;
                target[p][propertyKey] = value;
            }else {
                throw new ReferenceError(`target.${propertyKey} non object.`); 
            }
        }else{
            throw new ReferenceError(`target.${propertyKey} is not writable.`);
        }
    };

    Reflect.incre=function incre(scope,target,propertyKey,flag){
        var val = Reflect.get(scope,target,propertyKey);
        var result = val+1;
        Reflect.set(scope,target, propertyKey, result);
        return flag !== false ? val : result;
    }

    Reflect.decre= function decre(scope,target, propertyKey,flag){
        var val = Reflect.get(scope,target, propertyKey);
        var result = val-1;
        Reflect.set(scope,target, propertyKey,result);
        return flag !== false ? val : result;
    }
    return Reflect;

}(Reflect));