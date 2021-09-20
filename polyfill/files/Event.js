/*
 * EaseScript
 * Copyright © 2017 EaseScript All rights reserved.
 * Released under the MIT license
 * https://github.com/51breeze/EaseScript
 * @author Jun Ye <664371281@qq.com>
 * @require System,Object,Event,Internal,Symbol
 */
function Event( type, bubbles,cancelable ){
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.composed = false;
    this.currentTarget = null;
    this.target = null;
    this.defaultPrevented = false;
    this.eventPhase = NaN;
    this.isTrusted = false;
    this.returnValue = false;
    this.timeStamp = NaN;
    this.immediatePropagationStopped = false;
}

Event.prototype.preventDefault=function(){
    this.defaultPrevented = true;
}

Event.prototype.stopPropagation=function(){
    this.defaultPrevented = true;
    this.immediatePropagationStopped = true;
}

Event.prototype.stopImmediatePropagation=function(){
    this.immediatePropagationStopped = true;
}