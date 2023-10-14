/*
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */

///<references from='Class' />
///<export name='ESEvent' />
function ESEvent( type, bubbles, cancelable ){
    if( !type || typeof type !=="string" )throw new TypeError('event type is not string');
    this.type = type;
    this.bubbles = !!bubbles;
    this.cancelable = !!cancelable;
}

ESEvent.SUBMIT='submit';
ESEvent.RESIZE='resize';
ESEvent.SELECT='fetch';
ESEvent.UNLOAD='unload';
ESEvent.LOAD='load';
ESEvent.LOAD_START='loadstart';
ESEvent.PROGRESS='progress';
ESEvent.RESET='reset';
ESEvent.FOCUS='focus';
ESEvent.BLUR='blur';
ESEvent.ERROR='error';
ESEvent.COPY='copy';
ESEvent.BEFORECOPY='beforecopy';
ESEvent.CUT='cut';
ESEvent.BEFORECUT='beforecut';
ESEvent.PASTE='paste';
ESEvent.BEFOREPASTE='beforepaste';
ESEvent.SELECTSTART='selectstart';
ESEvent.READY='ready';
ESEvent.SCROLL='scroll';
ESEvent.INITIALIZE_COMPLETED = "initializeCompleted";
ESEvent.ANIMATION_START="animationstart";
ESEvent.ANIMATION_END="animationend";
ESEvent.ANIMATION_ITERATION="animationiteration";
ESEvent.TRANSITION_END="transitionend";

ESEvent.isEvent=function isEvent( obj ){
    if( obj ){
        return obj instanceof ESEvent || obj instanceof Event;
    }
    return false;
}

/**
 * 事件原型
 * @type {Object}
 */
ESEvent.prototype = Object.create( Object.prototype,{
    "constructor":{value:ESEvent}
});

ESEvent.prototype.bubbles = true;
ESEvent.prototype.cancelable = true;
ESEvent.prototype.currentTarget = null;
ESEvent.prototype.target = null;
ESEvent.prototype.defaultPrevented = false;
ESEvent.prototype.originalEvent = null;
ESEvent.prototype.type = null;
ESEvent.prototype.propagationStopped = false;
ESEvent.prototype.immediatePropagationStopped = false;
ESEvent.prototype.altkey = false;
ESEvent.prototype.button = false;
ESEvent.prototype.ctrlKey = false;
ESEvent.prototype.shiftKey = false;
ESEvent.prototype.metaKey = false;

/**
 * 阻止事件的默认行为
 */
ESEvent.prototype.preventDefault = function preventDefault(){
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
ESEvent.prototype.stopPropagation = function stopPropagation(){
    if( this.originalEvent ){
        this.originalEvent.stopPropagation ? this.originalEvent.stopPropagation() :  this.originalEvent.cancelBubble=true;
    }
    this.propagationStopped = true;
};

/**
 *  阻止向上冒泡事件，并停止执行当前事件类型的所有侦听器
 */
ESEvent.prototype.stopImmediatePropagation = function stopImmediatePropagation(){
    if( this.originalEvent && this.originalEvent.stopImmediatePropagation )this.originalEvent.stopImmediatePropagation();
    this.stopPropagation();
    this.immediatePropagationStopped = true;
};

/**
 * map event name
 * @internal ESEvent.fix;
 */
ESEvent.fix={
    map:{},
    hooks:{},
    prefix:'',
    cssprefix:'',
    cssevent:{},
    eventname:{
        'DOMContentLoaded':true
    }
};
ESEvent.fix.map[ ESEvent.READY ]='DOMContentLoaded';
ESEvent.fix.cssevent[ ESEvent.ANIMATION_START ]     ="AnimationStart";
ESEvent.fix.cssevent[ ESEvent.ANIMATION_END ]       ="AnimationEnd";
ESEvent.fix.cssevent[ ESEvent.ANIMATION_ITERATION ] ="AnimationIteration";
ESEvent.fix.cssevent[ ESEvent.TRANSITION_END ]      ="TransitionEnd";

/**
 * 获取统一的事件名
 * @param type
 * @param flag
 * @returns {*}
 * @internal ESEvent.type;
 */
ESEvent.type = function type( eventType, flag ){
    if( typeof eventType !== "string" )return eventType;
    if( flag===true ){
        eventType= ESEvent.fix.prefix==='on' ? eventType.replace(/^on/i,'') : eventType;
        var lower =  eventType.toLowerCase();
        if( ESEvent.fix.cssprefix && lower.substr(0, ESEvent.fix.cssprefix.length )===ESEvent.fix.cssprefix ){
            return lower.substr(ESEvent.fix.cssprefix.length);
        }
        for(var prop in ESEvent.fix.map){
            if( ESEvent.fix.map[prop].toLowerCase() === lower ){
                return prop;
            }
        }
        return eventType;
    }
    if( ESEvent.fix.cssevent[ eventType ] ){
        return ESEvent.fix.cssprefix ? ESEvent.fix.cssprefix+ESEvent.fix.cssevent[ eventType ] : eventType;
    }
    if( ESEvent.fix.eventname[ eventType ]===true )return eventType;
    return ESEvent.fix.map[ eventType ] ? ESEvent.fix.map[ eventType ] : ESEvent.fix.prefix+eventType.toLowerCase();
};

var eventModules=[];
ESEvent.registerEvent = function registerEvent( callback ){
    eventModules.push( callback );
};

/*
 * 根据原型事件创建一个ESEvent
 * @param event
 * @returns {ESEvent}
 * @internal ESEvent.create;
 */
ESEvent.create = function create( originalEvent ){
    if( !originalEvent || !ESEvent.isEvent(originalEvent) )throw new TypeError('Invalid originalEvent.');
    var event=null;
    var i=0;
    var type = originalEvent.type;
    var target = originalEvent.srcElement || originalEvent.target;
    target = target && target.nodeType===3 ? target.parentNode : target;
    var currentTarget =  originalEvent.currentTarget || target;
    if( typeof type !== "string" )throw new TypeError('Invalid event type');
    if( !(originalEvent instanceof ESEvent) ){
        type = ESEvent.type(type, true);
        while (i < eventModules.length && !(event = eventModules[i++](type, target, originalEvent)));
    }else{
        event = originalEvent;
    }
    if( !(event instanceof ESEvent) )event = new ESEvent( type );
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

ESEvent.fix.hooks[ ESEvent.READY ]=function (listener, dispatcher){
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
                    event= new ESEvent( ESEvent.READY );
                    break;
            }
        }
        if( event && has===false){
            has = true;
            if(id){
                window.clearInterval(id);
                id = null;
            }
            event = event instanceof ESEvent ? event : ESEvent.create( event );
            event.currentTarget = target;
            event.target = target;
            dispatcher( event );
        }
    }
    var type = ESEvent.type(ESEvent.READY);
    doc.addEventListener ? doc.addEventListener( type, handle) : doc.attachEvent(type, handle);
    id = window.setInterval(handle,50);
    return true;
}