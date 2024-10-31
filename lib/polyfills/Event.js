/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<export name='Event' />
function Event( type, bubbles, cancelable ){
    if( !type || typeof type !=="string" )throw new TypeError('event type is not string');
    this.type = type;
    this.bubbles = !!bubbles;
    this.cancelable = !!cancelable;
}

Event.SUBMIT='submit';
Event.RESIZE='resize';
Event.SELECT='fetch';
Event.UNLOAD='unload';
Event.LOAD='load';
Event.LOAD_START='loadstart';
Event.PROGRESS='progress';
Event.RESET='reset';
Event.FOCUS='focus';
Event.BLUR='blur';
Event.ERROR='error';
Event.COPY='copy';
Event.BEFORECOPY='beforecopy';
Event.CUT='cut';
Event.BEFORECUT='beforecut';
Event.PASTE='paste';
Event.BEFOREPASTE='beforepaste';
Event.SELECTSTART='selectstart';
Event.READY='ready';
Event.SCROLL='scroll';
Event.INITIALIZE_COMPLETED = "initializeCompleted";
Event.ANIMATION_START="animationstart";
Event.ANIMATION_END="animationend";
Event.ANIMATION_ITERATION="animationiteration";
Event.TRANSITION_END="transitionend";

Event.isEvent=function isEvent( obj ){
    if( obj ){
        return obj instanceof Event || obj instanceof Event;
    }
    return false;
}

/**
 * 事件原型
 * @type {Object}
 */
Event.prototype = Object.create( Object.prototype,{
    "constructor":{value:Event}
});

Event.prototype.bubbles = true;
Event.prototype.cancelable = true;
Event.prototype.currentTarget = null;
Event.prototype.target = null;
Event.prototype.defaultPrevented = false;
Event.prototype.originalEvent = null;
Event.prototype.type = null;
Event.prototype.propagationStopped = false;
Event.prototype.immediatePropagationStopped = false;
Event.prototype.altkey = false;
Event.prototype.button = false;
Event.prototype.ctrlKey = false;
Event.prototype.shiftKey = false;
Event.prototype.metaKey = false;

/**
 * 阻止事件的默认行为
 */
Event.prototype.preventDefault = function preventDefault(){
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
Event.prototype.stopPropagation = function stopPropagation(){
    if( this.originalEvent ){
        this.originalEvent.stopPropagation ? this.originalEvent.stopPropagation() :  this.originalEvent.cancelBubble=true;
    }
    this.propagationStopped = true;
};

/**
 *  阻止向上冒泡事件，并停止执行当前事件类型的所有侦听器
 */
Event.prototype.stopImmediatePropagation = function stopImmediatePropagation(){
    if( this.originalEvent && this.originalEvent.stopImmediatePropagation )this.originalEvent.stopImmediatePropagation();
    this.stopPropagation();
    this.immediatePropagationStopped = true;
};

/**
 * map event name
 * @internal ESEvent.fix;
 */
Event.fix={
    map:{},
    hooks:{},
    prefix:'',
    cssprefix:'',
    cssevent:{},
    eventname:{
        'DOMContentLoaded':true
    }
};
Event.fix.map[ Event.READY ]='DOMContentLoaded';
Event.fix.cssevent[ Event.ANIMATION_START ]     ="AnimationStart";
Event.fix.cssevent[ Event.ANIMATION_END ]       ="AnimationEnd";
Event.fix.cssevent[ Event.ANIMATION_ITERATION ] ="AnimationIteration";
Event.fix.cssevent[ Event.TRANSITION_END ]      ="TransitionEnd";

/**
 * 获取统一的事件名
 * @param type
 * @param flag
 * @returns {*}
 * @internal ESEvent.type;
 */
Event.type = function type( eventType, flag ){
    if( typeof eventType !== "string" )return eventType;
    if( flag===true ){
        eventType= Event.fix.prefix==='on' ? eventType.replace(/^on/i,'') : eventType;
        var lower =  eventType.toLowerCase();
        if( Event.fix.cssprefix && lower.substr(0, Event.fix.cssprefix.length )===Event.fix.cssprefix ){
            return lower.substr(Event.fix.cssprefix.length);
        }
        for(var prop in Event.fix.map){
            if( Event.fix.map[prop].toLowerCase() === lower ){
                return prop;
            }
        }
        return eventType;
    }
    if( Event.fix.cssevent[ eventType ] ){
        return Event.fix.cssprefix ? Event.fix.cssprefix+Event.fix.cssevent[ eventType ] : eventType;
    }
    if( Event.fix.eventname[ eventType ]===true )return eventType;
    return Event.fix.map[ eventType ] ? Event.fix.map[ eventType ] : Event.fix.prefix+eventType.toLowerCase();
};

var eventModules=[];
Event.registerEvent = function registerEvent( callback ){
    eventModules.push( callback );
};

/*
 * 根据原型事件创建一个ESEvent
 * @param event
 * @returns {ESEvent}
 * @internal ESEvent.create;
 */
Event.create = function create( originalEvent ){
    if( !originalEvent || !Event.isEvent(originalEvent) )throw new TypeError('Invalid originalEvent.');
    var event=null;
    var i=0;
    var type = originalEvent.type;
    var target = originalEvent.srcElement || originalEvent.target;
    target = target && target.nodeType===3 ? target.parentNode : target;
    var currentTarget =  originalEvent.currentTarget || target;
    if( typeof type !== "string" )throw new TypeError('Invalid event type');
    if( !(originalEvent instanceof Event) ){
        type = Event.type(type, true);
        while (i < eventModules.length && !(event = eventModules[i++](type, target, originalEvent)));
    }else{
        event = originalEvent;
    }
    if( !(event instanceof Event) )event = new Event( type );
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

Event.fix.hooks[ Event.READY ]=function (listener, dispatcher){
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
                    event= new Event( Event.READY );
                    break;
            }
        }
        if( event && has===false){
            has = true;
            if(id){
                window.clearInterval(id);
                id = null;
            }
            event = event instanceof Event ? event : Event.create( event );
            event.currentTarget = target;
            event.target = target;
            dispatcher( event );
        }
    }
    var type = Event.type(Event.READY);
    doc.addEventListener ? doc.addEventListener( type, handle) : doc.attachEvent(type, handle);
    id = window.setInterval(handle,50);
    return true;
}