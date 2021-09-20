/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 * @require System,Object,Event,Internal,Symbol
 */
var privateKey = Symbol('EventDispatcher');
function EventDispatcher( target ){
    if( !(this instanceof EventDispatcher) ){
        return target && target instanceof EventDispatcher ? target : new EventDispatcher( target );
    }
    this[privateKey]={};
    if( target ){
        if( target instanceof EventDispatcher){
            this[privateKey] = target;
        }else if(typeof target ==="object"){
            this[privateKey] = target[privateKey] || (target[privateKey]={});
        }
    }
}

EventDispatcher.prototype=Object.create(Object.prototype,{
    "constructor":{value:EventDispatcher}
});


/**
 * 判断是否有指定类型的侦听器
 * @param type
 * @param listener
 * @returns {boolean}
 */
EventDispatcher.prototype.hasEventListener=function hasEventListener( type , listener ){
    var target =  this[privateKey];
    if( target instanceof EventDispatcher ){
        return target.hasEventListener(type, listener);
    }
    if( Object.prototype.hasOwnProperty.call(target,type) ){
        var events = target[type];
        var length = events && events.length;
        if( length < 1 ){
            return false;
        }
        if( typeof listener !== "function" ){
            return length > 0;
        }
        while (length > 0){
            --length;
            if ( events[length].callback === listener ){
                return true;
            }
        }
    }
    return false;
};

/**
 * 添加侦听器
 * @param type
 * @param listener
 * @param priority
 * @returns {EventDispatcher}
 */
EventDispatcher.prototype.addEventListener=function addEventListener(type,callback,useCapture,priority,reference){
    if( typeof type !== 'string' )throw new TypeError('Invalid event type');
    if( typeof callback !== 'function' )throw new TypeError('Invalid callback function');
    var target =  this[privateKey];
    if( target instanceof EventDispatcher ){
        target.addEventListener(type,callback,useCapture,priority,reference||this);
        return this;
    }

    var events = target[type] || (target[type]=[]);
    events.push({
        'callback':callback,
        'useCapture':useCapture,
        'priority':priority,
        'reference':reference
    });

    if( events.length > 1 )events.sort(function(a,b){
        return a.priority=== b.priority ? 0 : (a.priority < b.priority ? 1 : -1);
    });
    return true;
};

/**
 * 移除指定类型的侦听器
 * @param type
 * @param listener
 * @returns {boolean}
 */
EventDispatcher.prototype.removeEventListener=function removeEventListener(type,listener){
    var target =  this[privateKey];
    if(target instanceof EventDispatcher ){
        return target.removeEventListener(type,listener);
    }
    var events = target[type] || [];
    var len = events && events.length >> 0;
    if( len < 1 ){
        return false;
    }
    if( !listener ){
        events.splice(0, len);
        return true;
    }
    while(len>0 && events[--len] ){
        var item = events[--len];
        if( listener ){
            if( item.callback === listener ){
                events.splice(len, 1);
            }
        }
    }
    return len != events.length;
};

/**
 * 调度指定事件
 * @param event
 * @returns {boolean}
 */
EventDispatcher.prototype.dispatchEvent=function dispatchEvent(event){
    var target =  this[privateKey];
    if( target instanceof EventDispatcher ){
        return target.dispatchEvent(event);
    }
    event.target = event.currentTarget = this;
    var events = target[ event.type ];
    var len = events && events.length >> 0;
    if( len > 0 ){
        var index = 0;
        while(index < len){
            var item = events[ index++ ];
            var thisArg = item.reference || this;
            item.callback.call(thisArg , event);
            if( event.immediatePropagationStopped===true )
               return false;
        }
        return !event.immediatePropagationStopped;
    }
    return false;
};