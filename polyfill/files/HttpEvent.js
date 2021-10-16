/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 */
function HttpEvent( type, bubbles,cancelable ){
    if( !(this instanceof HttpEvent) )return new HttpEvent(type, bubbles,cancelable);
    Event.call(this, type, bubbles,cancelable );
    return this;
};

HttpEvent.prototype=Object.create( Event.prototype,{
    "constructor":{value:HttpEvent},
    "toString":{value:function toString(){
        return '[object HttpEvent]';
    }},
    "valueOf":{value:function valueOf(){
        return '[object HttpEvent]';
    }}
});
HttpEvent.prototype.data=null;
HttpEvent.prototype.url=null;
HttpEvent.prototype.loaded = 0;
HttpEvent.prototype.total = 0;
HttpEvent.prototype.method = 'get';
HttpEvent.prototype.param = null;
HttpEvent.LOAD_START = 'httpLoadStart';
HttpEvent.SUCCESS = 'httpSuccess';
HttpEvent.PROGRESS = 'httpProgress';
HttpEvent.ERROR   = 'httpError';
HttpEvent.CANCELED  = 'httpCanceled';
HttpEvent.TIMEOUT = 'httpTimeout';

//属性事件
Event.registerEvent(function (type, target, originalEvent )
{
    if( originalEvent instanceof HttpEvent )return originalEvent;
});