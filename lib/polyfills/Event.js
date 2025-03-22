/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<export name='__Event' />
function __Event( type, bubbles, cancelable ){
    if( !type || typeof type !=="string" )throw new TypeError('event type is not string');
    this.type = type;
    this.bubbles = !!bubbles;
    this.cancelable = !!cancelable;
}

__Event.SUBMIT='submit';
__Event.RESIZE='resize';
__Event.SELECT='fetch';
__Event.UNLOAD='unload';
__Event.LOAD='load';
__Event.LOAD_START='loadstart';
__Event.PROGRESS='progress';
__Event.RESET='reset';
__Event.FOCUS='focus';
__Event.BLUR='blur';
__Event.ERROR='error';
__Event.COPY='copy';
__Event.BEFORECOPY='beforecopy';
__Event.CUT='cut';
__Event.BEFORECUT='beforecut';
__Event.PASTE='paste';
__Event.BEFOREPASTE='beforepaste';
__Event.SELECTSTART='selectstart';
__Event.READY='ready';
__Event.SCROLL='scroll';
__Event.INITIALIZE_COMPLETED = "initializeCompleted";
__Event.ANIMATION_START="animationstart";
__Event.ANIMATION_END="animationend";
__Event.ANIMATION_ITERATION="animationiteration";
__Event.TRANSITION_END="transitionend";

__Event.isEvent=function isEvent( obj ){
    if( obj ){
        return obj instanceof __Event || obj instanceof Event;
    }
    return false;
}

/**
 * 事件原型
 * @type {Object}
 */
__Event.prototype = Object.create( Object.prototype,{
    "constructor":{value:__Event}
});

__Event.prototype.bubbles = true;
__Event.prototype.cancelable = true;
__Event.prototype.currentTarget = null;
__Event.prototype.target = null;
__Event.prototype.defaultPrevented = false;
__Event.prototype.originalEvent = null;
__Event.prototype.type = null;
__Event.prototype.propagationStopped = false;
__Event.prototype.immediatePropagationStopped = false;
__Event.prototype.altkey = false;
__Event.prototype.button = false;
__Event.prototype.ctrlKey = false;
__Event.prototype.shiftKey = false;
__Event.prototype.metaKey = false;

/**
 * 阻止事件的默认行为
 */
__Event.prototype.preventDefault = function preventDefault(){
    if( this.cancelable===true ){
        this.defaultPrevented = true;
        if ( this.originalEvent ){
            if( this.originalEvent.preventDefault ){
                this.originalEvent.preventDefault();
            }else{
                this.originalEvent.returnValue = false;
            }
        }
    }
};

/**
 * 阻止向上冒泡事件
 */
__Event.prototype.stopPropagation = function stopPropagation(){
    if( this.originalEvent ){
        this.originalEvent.stopPropagation ? this.originalEvent.stopPropagation() :  this.originalEvent.cancelBubble=true;
    }
    this.propagationStopped = true;
};

/**
 *  阻止向上冒泡事件，并停止执行当前事件类型的所有侦听器
 */
__Event.prototype.stopImmediatePropagation = function stopImmediatePropagation(){
    if( this.originalEvent && this.originalEvent.stopImmediatePropagation )this.originalEvent.stopImmediatePropagation();
    this.stopPropagation();
    this.immediatePropagationStopped = true;
};

/**
 * map event name
 * @internal ESEvent.fix;
 */
__Event.fix={
    map:{},
    hooks:{},
    prefix:'',
    cssprefix:'',
    cssevent:{},
    eventname:{
        'DOMContentLoaded':true
    }
};
__Event.fix.map[ __Event.READY ]='DOMContentLoaded';
__Event.fix.cssevent[ __Event.ANIMATION_START ]     ="AnimationStart";
__Event.fix.cssevent[ __Event.ANIMATION_END ]       ="AnimationEnd";
__Event.fix.cssevent[ __Event.ANIMATION_ITERATION ] ="AnimationIteration";
__Event.fix.cssevent[ __Event.TRANSITION_END ]      ="TransitionEnd";

/**
 * 获取统一的事件名
 * @param type
 * @param flag
 * @returns {*}
 * @internal ESEvent.type;
 */
__Event.type = function type( eventType, flag ){
    if( typeof eventType !== "string" )return eventType;
    if( flag===true ){
        eventType= __Event.fix.prefix==='on' ? eventType.replace(/^on/i,'') : eventType;
        var lower =  eventType.toLowerCase();
        if( __Event.fix.cssprefix && lower.substr(0, __Event.fix.cssprefix.length )===__Event.fix.cssprefix ){
            return lower.substr(__Event.fix.cssprefix.length);
        }
        for(var prop in __Event.fix.map){
            if( __Event.fix.map[prop].toLowerCase() === lower ){
                return prop;
            }
        }
        return eventType;
    }
    if( __Event.fix.cssevent[ eventType ] ){
        return __Event.fix.cssprefix ? __Event.fix.cssprefix+__Event.fix.cssevent[ eventType ] : eventType;
    }
    if( __Event.fix.eventname[ eventType ]===true )return eventType;
    return __Event.fix.map[ eventType ] ? __Event.fix.map[ eventType ] : __Event.fix.prefix+eventType.toLowerCase();
};

var eventModules=[];
__Event.registerEvent = function registerEvent( callback ){
    eventModules.push( callback );
};

/*
 * 根据原型事件创建一个ESEvent
 * @param event
 * @returns {ESEvent}
 * @internal ESEvent.create;
 */
__Event.create = function create( originalEvent ){
    if( !originalEvent || !__Event.isEvent(originalEvent) )throw new TypeError('Invalid originalEvent.');
    var event=null;
    var i=0;
    var type = originalEvent.type;
    var target = originalEvent.srcElement || originalEvent.target;
    target = target && target.nodeType===3 ? target.parentNode : target;
    var currentTarget =  originalEvent.currentTarget || target;
    if( typeof type !== "string" )throw new TypeError('Invalid event type');
    if( !(originalEvent instanceof __Event) ){
        type = __Event.type(type, true);
        while (i < eventModules.length && !(event = eventModules[i++](type, target, originalEvent)));
    }else{
        event = originalEvent;
    }
    if( !(event instanceof __Event) )event = new __Event( type );
    event.type=type;
    event.target=target;
    event.currentTarget = currentTarget;
    event.bubbles = originalEvent.bubbles;
    event.cancelable = originalEvent.cancelable;
    event.originalEvent = originalEvent;
    event.timeStamp = originalEvent.timeStamp;
    event.relatedTarget= originalEvent.relatedTarget;
    event.altkey= !!originalEvent.altkey;
    event.button= originalEvent.button;
    event.ctrlKey= !!originalEvent.ctrlKey;
    event.shiftKey= !!originalEvent.shiftKey;
    event.metaKey= !!originalEvent.metaKey;
    event.defaultPrevented= originalEvent.defaultPrevented;
    event.eventPhase= originalEvent.eventPhase;
    event.composed= originalEvent.composed;
    event.isTrusted= originalEvent.isTrusted;
    if( originalEvent.animationName ){
        event.animationName = originalEvent.animationName;
        event.elapsedTime   = originalEvent.elapsedTime;
        event.eventPhase   = originalEvent.eventPhase;
        event.isTrusted   = originalEvent.isTrusted;
    }
    return event;
};

__Event.fix.hooks[ __Event.READY ]=function (listener, dispatcher){
    var target=this;
    var doc = this.contentWindow ?  this.contentWindow.document : this.ownerDocument || this.document || this;
    var win=  doc && doc.nodeType===9 ? doc.defaultView || doc.parentWindow : window;
    if( !(win || doc) )return;
    var id = null;
    var has = false;
    var handle=function(event){
        if( !event ){
            switch ( doc.readyState ){
                case 'loaded'   :
                case 'complete' :
                case '4'        :
                    event= new __Event( __Event.READY );
                    break;
            }
        }
        if( event && has===false){
            has = true;
            if(id){
                window.clearInterval(id);
                id = null;
            }
            event = event instanceof __Event ? event : __Event.create( event );
            event.currentTarget = target;
            event.target = target;
            dispatcher( event );
        }
    }
    var type = __Event.type(__Event.READY);
    doc.addEventListener ? doc.addEventListener( type, handle) : doc.attachEvent(type, handle);
    id = window.setInterval(handle,50);
    return true;
}