"use strict";
(function(definedModules){

    /**
     * 已加载的模块
     */
    var installedModules = {};

    /**
     * 加载并初始化模块
     * @param string 
     */
    function require( identifier ){
        if( installedModules[identifier] ){
            return installedModules[identifier].exports;
        }
    
        if( !definedModules.hasOwnProperty(identifier) ){
             throw new ReferenceError("Require module '"+identifier +"' is not exists.");
        }
    
        var module = installedModules[identifier] = {
            'id': identifier,
            'require':require,
            'done':false,
            'exports':null,
        };
    
        definedModules[identifier].call(module, module);
        module.done = true;
        return module.exports;
    }

    /**
     * 判断是否有定义此标识符的模块
     */
    require.has=function has( identifier ){
        return definedModules.hasOwnProperty(identifier);
    }

    /**
     * 加载入口文件
     */
    /*enter class Test*/
	require(10);
    
}({
0:/*
Class com.Person
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	var _private=Symbol("private");
	function Person(){
		this.hasOwnProperty("name");
	}
	Class.creator(0,Person,{
		'id':1,
		'ns':'com',
		'name':'Person',
		'private':_private
	});
	__MODULE__.exports=Person;
},
1:/*
Class Class
*/
function(__MODULE__){
	var __MODULES__=[];
	var key=Symbol("CLASS_KEY");
	var Class={
	    'key':key,
	    'modules':__MODULES__,
	    'require':function(id){
	        return __MODULES__[id];
	    },
	    'creator':function(id,moduleClass,description){
	        if( description ){
	            if( description.inherit ){
	                Object.defineProperty(moduleClass,'prototype',{value:Object.create(description.inherit.prototype)});
	            }
	            if( description.methods ){
	                Object.defineProperties(moduleClass,description.methods);
	            }
	            if( description.members ){
	                Object.defineProperties(moduleClass.prototype,description.members);
	            }
	            Object.defineProperty(moduleClass,key,{value:description});
	            Object.defineProperty(moduleClass,'name',{value:description.name});
	            Object.defineProperty(moduleClass,'toString',{value:function toString(){
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
	        }
	        Object.defineProperty(moduleClass.prototype,'constructor',{value:moduleClass});
	        if( id ){
	            __MODULES__[id] = moduleClass;
	        }
	    },
	    'getClassByName':function(name){
	        var len = __MODULES__.length;
	        var index = 0;
	        for(;index<len;index++){
	            var classModule = __MODULES__[index];
	            var description = classModule[key];
	            if( description ){
	                var key = description.ns ? description.ns+'.'+description.name : description.name;
	                if( key === name){
	                    return classModule;
	                }
	            }
	        }
	        return null;
	    }
	};
	__MODULE__.exports=Class;
},
2:/*
Class Person
*/
function(__MODULE__){
	var TestInterface = __MODULE__.require(6);
	var Class = __MODULE__.require(1);
	var _private=Symbol("private");
	function Person(name){
		Object.defineProperty(this,_private,{value:{'_name':'','_type':null}});
		Object.call(this);
		this[_private]._name=name;
	}
	var members = {};
	members.addressName={m:3,d:1,writable:true,enumerable:true,value:"the Person properyt \"addressName\""};
	members._name={m:1,d:1,writable:true,value:''};
	members._type={m:1,d:1,writable:true,value:null};
	members.target={m:3,d:4,enumerable:true,get:function target(){
		return this;
	}};
	members.setType={m:3,d:3,value:function setType(a){
		this[_private]._type=a;
		return a;
	}};
	members.method={m:3,d:3,value:function method(name,age){
		var str = ["a","1"];
		var b = ["",["1",1]];
		var cc = [1];
		var x = [1,1,'2222',{}];
		b.push('1');
		b.push(['1',1]);
		var c = -1968;
		var bs = 22.366;
		var bss = 22.366;
		var bssd = -22.366;
		Person.prototype.address.call(this.target);
		return "sssss";
	}};
	members.name={m:3,d:4,enumerable:true,get:function name(){
		return this[_private]._name;
	},set:function name(val){
		this[_private]._name=val;
	}};
	members.avg={m:3,d:3,value:function avg(a,b){
	
	}};
	members.address={m:1,d:3,value:function address(){
	
	}};
	members.addressNamesss={m:2,d:3,value:function addressNamesss(){
	
	}};
	Class.creator(2,Person,{
		'id':1,
		'ns':'',
		'name':'Person',
		'private':_private,
		'imps':[TestInterface],
		'inherit':Object,
		'members':members
	});
	__MODULE__.exports=Person;
},
3:/*
Class EventDispatcher
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	var Event = __MODULE__.require(4);
	/*
	 * EaseScript
	 * Copyright © 2017 EaseScript All rights reserved.
	 * Released under the MIT license
	 * https://github.com/51breeze/EaseScript
	 * @author Jun Ye <664371281@qq.com>
	 */
	var __KEY__ = Symbol('EventDispatcher');
	function EventDispatcher( target ){
	
	    if( !(this instanceof EventDispatcher) ){
	        return new EventDispatcher( target );
	    }
	
	    var init = {
	        proxy:target,
	        isEvent:false,
	        events:{}
	    };
	    if( target ){
	        if( typeof target !== 'object'){
	            throw new Error('target is not object');
	        }
	        init.isEvent = target instanceof EventDispatcher;
	        this[ __KEY__ ] = target[ __KEY__ ] || (target[ __KEY__ ]=init);
	    }else{
	        this[ __KEY__ ] = init;
	    }
	}
	
	EventDispatcher.prototype=Object.create( Object.prototype,{
	    "constructor":{value:EventDispatcher}
	});
	
	
	/**
	 * 判断是否有指定类型的侦听器
	 * @param type
	 * @param listener
	 * @returns {boolean}
	 */
	EventDispatcher.prototype.hasEventListener=function hasEventListener( type , listener ){
	    var target =  this[ __KEY__ ];
	    if( target.isEvent ){
	        return target.proxy.hasEventListener(type, listener);
	    }
	    var events = target.events[type];
	    var len = events && events.length >> 0;
	    if( len > 0 && listener === void 0 )return true;
	    while(len>0 && events[--len] ){
	        if( events[len].callback === listener ){
	            return true;
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
	    var target =  this[ __KEY__ ];
	    if( target.isEvent ){
	        target.proxy.addEventListener(type,callback,useCapture,priority,reference||this);
	        return this;
	    }
	    var listener = new Listener(type,callback,useCapture,priority,reference,this);
	    var events = target.events[ type ] || ( target.events[ type ]=[] );
	    if( events.length < 1 && target.proxy ){
	        listener.proxyHandle = $dispatchEvent;
	        listener.proxyTarget = target.proxy;
	        listener.proxyType = [type];
	        if( Object.prototype.hasOwnProperty.call(Event.fix.hooks,type) ){
	            Event.fix.hooks[ type ].call(target, listener, listener.proxyHandle);
	        }else {
	            type = Event.type(type);
	            try {
	                if(target.proxy.addEventListener){
	                    target.proxy.addEventListener(type, listener.proxyHandle, listener.useCapture);
	                }else{
	                    listener.proxyHandle=function (e) {
	                        $dispatchEvent(e, target.proxy);
	                    }
	                    target.proxy.attachEvent(type, listener.proxyHandle);
	                }
	            }catch (e) {}
	        }
	    }
	    events.push( listener );
	    if( events.length > 1 ) events.sort(function(a,b){
	        return a.priority=== b.priority ? 0 : (a.priority < b.priority ? 1 : -1);
	    });
	    return this;
	};
	
	/**
	 * 移除指定类型的侦听器
	 * @param type
	 * @param listener
	 * @returns {boolean}
	 */
	EventDispatcher.prototype.removeEventListener=function removeEventListener(type,listener){
	    var target =  this[ __KEY__ ];
	    if(target.isEvent){
	        return target.proxy.removeEventListener(type,listener);
	    }
	    var events = target.events[ type ];
	    var len = events && events.length >> 0;
	    var ret = len;
	    if( len<1 ){
	        return false;
	    }
	    while (len > 0){
	        --len;
	        if ( !listener || events[len].callback === listener ){
	            var result = events.splice(len, 1);
	            if( result[0] && target.proxyHandle ){
	                var types = result[0].proxyType;
	                var num = types.length;
	                while ( num > 0 ){
	                    $removeListener(result[0].proxyTarget, types[ --num ], result[0].proxyHandle);
	                }
	            }
	        }
	    }
	    return events.length !== ret;
	};
	
	/**
	 * 调度指定事件
	 * @param event
	 * @returns {boolean}
	 */
	EventDispatcher.prototype.dispatchEvent=function dispatchEvent( event ){
	    if( !(event instanceof Event) )throw new TypeError('Invalid event');
	    var target =  this[ __KEY__ ];
	    if( target.isEvent ){
	        return target.proxy.dispatchEvent(event);
	    }
	    event.target = event.currentTarget=this;
	    return $dispatchEvent( event );
	};
	
	
	function $removeListener(target, type , handle ){
	    var eventType= Event.type( type );
	    if( target.removeEventListener ){
	        target.removeEventListener(eventType,handle,false);
	        target.removeEventListener(eventType,handle,true);
	    }else if( target.detachEvent ){
	        target.detachEvent(eventType,handle);
	    }
	}
	
	/**
	 * 调度指定侦听项
	 * @param event
	 * @param listeners
	 * @returns {boolean}
	 */
	function $dispatchEvent(e, currentTarget){
	    if( !(e instanceof Event) ){
	        e = Event.create( e );
	        if(currentTarget)e.currentTarget = currentTarget;
	    }
	    if( !e || !e.currentTarget )throw new Error('Invalid event target');
	    var target = e.currentTarget;
	    var events = target[ __KEY__ ] && target[ __KEY__ ].events[ e.type ];
	    if( !events || events.length < 1 )return true;
	    events = events.slice(0);
	    var length= 0,listener,thisArg,count=events.length;
	    while( length < count ){
	        listener = events[ length++ ];
	        thisArg = listener.reference || listener.dispatcher;
	        listener.callback.call( thisArg , e );
	        if( e.immediatePropagationStopped===true ){
	           return false;
	        }
	    }
	    return true;
	}
	
	/**
	 * 事件侦听器
	 * @param type
	 * @param callback
	 * @param priority
	 * @param capture
	 * @param currentTarget
	 * @param target
	 * @constructor
	 */
	function Listener(type,callback,useCapture,priority,reference,dispatcher){
	    this.type=type;
	    this.callback=callback;
	    this.useCapture=!!useCapture;
	    this.priority=priority>>0;
	    this.reference=reference || null;
	    this.dispatcher=dispatcher;
	}
	
	Object.defineProperty(Listener.prototype,"constructor",{value:Listener});
	Listener.prototype.useCapture=false;
	Listener.prototype.dispatcher=null;
	Listener.prototype.reference=null;
	Listener.prototype.priority=0;
	Listener.prototype.callback=null;
	Listener.prototype.type=null;
	Listener.prototype.proxyHandle = null;
	Listener.prototype.proxyTarget = null;
	Listener.prototype.proxyType = null;
	Class.creator(3,EventDispatcher,{
		'id':1,
		'global':true,
		'dynamic':false,
		'name':'EventDispatcher'
	});
	__MODULE__.exports=EventDispatcher;
},
4:/*
Class Event
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	/*
	 * Copyright © 2017 EaseScript All rights reserved.
	 * Released under the MIT license
	 * https://github.com/51breeze/EaseScript
	 * @author Jun Ye <664371281@qq.com>
	 */
	function Event( type, bubbles, cancelable ){
	    if( !type || typeof type !=="string" )throw new TypeError('event type is not string');
	    this.type = type;
	    this.bubbles = !(bubbles===false);
	    this.cancelable = !(cancelable===false);
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
	
	/**
	 * 事件原型
	 * @type {Object}
	 */
	Event.prototype = Object.create( Object.prototype,{
	    "constructor":{value:Event},
	    "toString":function toString(){
	        return '[object Event]';
	    },
	    "valueOf":function valueOf(){
	        return '[object Event]';
	    }
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
	 * @internal Event.fix;
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
	 * @internal Event.type;
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
	 * 根据原型事件创建一个Event
	 * @param event
	 * @returns {Event}
	 * @internal Event.create;
	 */
	Event.create = function create( originalEvent ){
	    originalEvent=originalEvent ? originalEvent : (typeof window === "object" ? window.event : null);
	    var event=null;
	    var i=0;
	    if( !originalEvent )throw new TypeError('Invalid event');
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
	    event.bubbles = originalEvent.bubbles !== false;
	    event.cancelable = originalEvent.cancelable !== false;
	    event.originalEvent = originalEvent;
	    event.timeStamp = originalEvent.timeStamp;
	    event.relatedTarget= originalEvent.relatedTarget;
	    event.altkey= !!originalEvent.altkey;
	    event.button= originalEvent.button;
	    event.ctrlKey= !!originalEvent.ctrlKey;
	    event.shiftKey= !!originalEvent.shiftKey;
	    event.metaKey= !!originalEvent.metaKey;
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
	Class.creator(4,Event,{
		'id':1,
		'global':true,
		'dynamic':true,
		'name':'Event'
	});
	__MODULE__.exports=Event;
},
5:/*
Enum Types
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	function Types(){}
	const methods = {};
	methods.ADDRESS={m:3,d:6,value:0};
	methods[0]={m:3,d:5,value:"ADDRESS"};
	methods.NAME={m:3,d:6,value:1};
	methods[1]={m:3,d:5,value:"NAME"};
	Class.creator(5,Types,{
		'id':3,
		'ns':'',
		'name':'Types',
		'inherit':Object,
		'methods':methods
	});
	__MODULE__.exports=Types;
},
6:/*
Interface com.TestInterface
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	function TestInterface(){}
	Class.creator(6,TestInterface,{
		'id':2,
		'ns':'com',
		'name':'TestInterface'
	});
	__MODULE__.exports=TestInterface;
},
7:/*
Class Skin
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	var _private=Symbol("private");
	function Skin(){
		Object.defineProperty(this,_private,{value:{'test':'sss'}});
		web_components_Skin.call(this);
		this.name = "ssss";
	}
	var members = {};
	members.test={m:1,d:1,writable:true,value:'sss'};
	members.mounted={m:3,d:3,value:function mounted(){
	
	}};
	members.name={m:3,d:4,enumerable:true,get:function name(){
		return 'name';
	},set:function name(value){
	
	}};
	members.render={m:3,d:3,value:function render(createElement){
		return createElement('div',null, [
		createElement('div',null, [
				this.name
			]),
		createElement('div',null, [
				'sdfs'
			])
		]);
	}};
	Class.creator(7,Skin,{
		'id':1,
		'ns':'',
		'name':'Skin',
		'private':_private,
		'inherit':web_components_Skin,
		'members':members
	});
	__MODULE__.exports=Skin;
},
8:/*
Class System
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	var EventDispatcher = __MODULE__.require(3);
	function System(){
	    throw new SyntaxError('System is not constructor.');
	};
	System.getIterator=function getIterator(object){
	    if( !object )return null;
	    if( object[Symbol.iterator] ){
	        return object[Symbol.iterator]();
	    }
	    var type = typeof object;
	    if( type==="object" || type ==="boolean" || type ==="number" || object.length === void 0 ){
	        throw new TypeError("object is not iterator");
	    }
	    return (function(object){ 
	        return{
	            index:0,
	            next:function next(){
	                if (this.index < object.length) {
	                    return {value:object[this.index++],done:false};
	                }
	                return {value:undefined,done:true};
	            }
	        };
	    })(object);
	}
	
	System.awaiter = function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	}
	
	System.generator = function (thisArg, body) {
	    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
	    function verb(n) { return function (v) { return step([n, v]); }; }
	    function step(op) {
	        if (f) throw new TypeError("Generator is already executing.");
	        while (_) try {
	            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	            if (y = 0, t) op = [op[0] & 2, t.value];
	            switch (op[0]) {
	                case 0: case 1: t = op; break;
	                case 4: _.label++; return { value: op[1], done: false };
	                case 5: _.label++; y = op[1]; op = [0]; continue;
	                case 7: op = _.ops.pop(); _.trys.pop(); continue;
	                default:
	                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
	                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
	                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
	                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
	                    if (t[2]) _.ops.pop();
	                    _.trys.pop(); continue;
	            }
	            op = body.call(thisArg, _);
	        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
	        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	    }
	}
	
	System.is=function is(left,right){
	    if(!left || !right || typeof left !== "object")return false;
	    var rId = right[Class.key] ? right[Class.key].id : null;
	    var description =  left.constructor ? left.constructor[Class.key] : null;
	    if( rId === 0 && description && description.id === 1 ){
	        return (function check(description,id){
	            if( !description )return false;
	            var imps = description.imps;
	            var inherit = description.inherit;
	            if( inherit === right )return true;
	            if( imps ){
	                for(var i=0;i<imps.length;i++){
	                    if( imps[i] === right || check( imps[i][Class.key], 0 ) )return true;
	                }
	            }
	            if( inherit && inherit[ Class.key ].id === id){
	                return check( inherit[Class.key], 0);
	            }
	            return false;
	        })(description,1);
	    }
	    return left instanceof right;
	}
	
	System.isClass=function isClass(classObject){
	    if( !classObject || !classObject.constructor)return false;
	    var desc = classObject[ Class.key ];
	    return desc && desc.id === 1 || (typeof classObject === "function" && classObject.constructor !== Function);
	}
	
	System.isInterface=function isInterface(classObject){
	    var desc = classObject && classObject[ Class.key ];
	    return desc && desc.id === 2;
	}
	
	System.isEnum=function isEnum(classObject){
	    var desc = classObject && classObject[ Class.key ];
	    return desc && desc.id === 3;
	}
	
	System.isFunction=function isFunction(target){
	   return target && target.constructor === Function;
	}
	
	System.isArray=function isArray(object){
	    return Array.isArray(object); 
	}
	
	System.toArray=function toArray(object){
	    if( Array.isArray(object) ){
	        return object;
	    }
	    var arr = [];
	    for(var key in object){
	        if( Object.prototype.hasOwnProperty.call(object,key) ){
	            arr.push(object[key]);
	        } 
	    }
	    return arr;
	}
	
	var __EventDispatcher = null;
	System.getEventDispatcher=function getEventDispatcher(){
	    if( __EventDispatcher === null ){
	        __EventDispatcher = new EventDispatcher(window);
	    }
	    return __EventDispatcher;
	}
	
	/**
	 * 根据指定的类名获取类的对象
	 * @param name
	 * @returns {Object}
	 */
	 System.getDefinitionByName = function getDefinitionByName(name){
	     var module = Class.getClassByName(name);
	     if( module ){
	         return module;
	     }
	     throw new TypeError('"' + name + '" is not defined.');
	 };
	 
	 System.hasClass = function hasClass(name){
	     return !!Class.getClassByName(name);
	 };
	 
	 /**
	  * 返回类的完全限定类名
	  * @param value 需要完全限定类名称的对象。
	  * 可以将任何类型、对象实例、原始类型和类对象
	  * @returns {string}
	  */
	 System.getQualifiedClassName = function getQualifiedClassName( target ){
	     if( target == null )throw new ReferenceError( 'target is null or undefined' );
	     if( target===System )return 'System';
	     if( typeof target === "function" && target.prototype){
	         var desc = target && target[ Class.key ];
	         if( desc ){
	            return desc.ns ? desc.ns+'.'+desc.name : desc.name;
	         }
	         var str = target.toString();
	         str = str.substr(0, str.indexOf('(') );
	         return str.substr(str.lastIndexOf(' ')+1);
	     }
	     throw new ReferenceError( 'target is not Class' );
	 };
	 
	 /**
	  * 返回对象的完全限定类名
	  * @param value 需要完全限定类名称的对象。
	  * 可以将任何类型、对象实例、原始类型和类对象
	  * @returns {string}
	  */
	 System.getQualifiedObjectName = function getQualifiedObjectName( target ){
	     if( target == null || typeof target !== "object"){
	         throw new ReferenceError( 'target is not object or is null' );
	     }
	     return System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
	 };
	 /**
	  * 获取指定实例对象的超类名称
	  * @param value
	  * @returns {string}
	  */
	 System.getQualifiedSuperClassName =function getQualifiedSuperClassName(target){
	     if( target == null )throw new ReferenceError( 'target is null or undefined' );
	     var classname = System.getQualifiedClassName( Object.getPrototypeOf( target ).constructor );
	     var module = Class.getClassByName(classname);
	     if( module ){
	         return System.getQualifiedClassName( module.inherit || Object );
	     }
	     return null;
	 };
	Class.creator(8,System,{
		'id':1,
		'global':true,
		'dynamic':false,
		'name':'System'
	});
	__MODULE__.exports=System;
},
9:/*
Class Reflect
*/
function(__MODULE__){
	var Class = __MODULE__.require(1);
	var System = __MODULE__.require(8);
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
	    Reflect.get=function(scope,target,propertyKey,receiver){
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
	        receiver = receiver || target;
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
	        receiver = receiver || target;
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
	Class.creator(9,_Reflect,{
		'id':1,
		'global':true,
		'dynamic':false,
		'name':'Reflect'
	});
	__MODULE__.exports=_Reflect;
},
10:/*
Class Test
*/
function(__MODULE__){
	var Person = __MODULE__.require(2);
	var com_Person = __MODULE__.require(0);
	var EventDispatcher = __MODULE__.require(3);
	var Event = __MODULE__.require(4);
	var Types = __MODULE__.require(5);
	var TestInterface = __MODULE__.require(6);
	var Skin = __MODULE__.require(7);
	var Class = __MODULE__.require(1);
	var System = __MODULE__.require(8);
	var Reflect = __MODULE__.require(9);
	var _private=Symbol("private");
	function Test(name,age){
		Object.defineProperty(this,_private,{value:{'bbss':'bbss','age':40,'len':5,'currentIndex':0}});
		Person.call(this,name);
		Person.prototype.setType.call(this,'1');
		this.target;
	}
	var methods = {};
	methods.getClass={m:3,d:3,value:function getClass(){
		var a = Test;
		var buname = {"a":1};
		buname.test=a;
		buname.person=Person;
		var test=buname.test;
		test.getClassObject();
		return buname;
	}};
	methods.getClassObject={m:3,d:3,value:function getClassObject(){
		var a = Test;
		var b = {"test":a};
		b.person=Person;
		return b.test;
	}};
	methods.getObject={m:3,d:3,value:function getObject(){
		return new Test('1','2');
	}};
	methods.uuName={m:3,d:4,enumerable:true,get:function uuName(){
		return 'uuName';
	}};
	methods.iiu={m:1,d:1,writable:true,value:Test};
	var members = {};
	members.bbss={m:1,d:1,writable:true,value:'bbss'};
	members.age={m:1,d:2,value:40};
	members.start={m:3,d:3,value:function start(){
		var _this = this;
		it("static get uuName accessor",function(){
			expect(Test.getClassObject().uuName).toBe("uuName");
		});
		it("'this.age' should is true",function(){
			expect(_this[_private].age).toBe(40);
		});
		it("'System.className' should is true",function(){
			expect('Test').toBe(System.getQualifiedClassName(Test));
		});
		it("'this instanceof Person' should is true",function(){
			expect(_this instanceof Person).toBeTrue();
		});
		it("\"this is Person\" should is true",function(){
			expect(System.is(_this,Person)).toBeTrue();
		});
		it("'this instanceof TestInterface' should is false",function(){
			expect(_this instanceof TestInterface).toBeFalse();
		});
		it("'this is TestInterface' should is true",function(){
			expect(System.is(_this,TestInterface)).toBeFalse();
		});
		it("'Test.getClass().test' should is Test",function(){
			expect(Test.getClass().test).toBe(Test);
		});
		it("'Test.getClass().person' should is Person",function(){
			expect(Test.getClass().person).toBe(Person);
		});
		it("'new (Test.getClass().person)('')' should is true",function(){
			const o = new (Test.getClass().person)('name');
			expect(o instanceof Person).toBeTrue();
		});
		it("'this.bbss=\"666666\"' should is '666666' ",function(){
			expect(_this[_private].bbss).toBe('bbss');
			_this[_private].bbss="666666";
			expect(_this[_private].bbss).toBe('666666');
		});
		it("test name accessor ",function(){
			expect(_this.name).toBe('Test');
			_this.name="test name";
			expect(_this.name).toBe('test name');
		});
		it("'var bsp = ()=>{}' should is '()=>this' ",function(){
			var bsp = function(){
				return _this;
			};
			expect(bsp()).toBe(_this);
		});
		it("once.two.three should is this or object ",function(){
			var bsp = function(flag){
				return _this;
			};
			var obj = {};
			bsp=function(flag){
				if(flag){
					return obj;
				}else{
					return _this;
				}
			};
			var obds = 1;
			const three = bsp(false);
			var once = {"two":{"three":three,"four":bsp}};
			expect(once.two.three).toBe(_this);
			expect(once.two.four(true)).toBe(obj);
			once[obds];
		});
		it("/d+/.test( \"123\" ) should is true ",function(){
			expect(/\d+/.test("123")).toBe(true);
			expect(/^\d+/.test(" 123")).toBe(false);
		});
		it("test rest params",function(){
			const res = _this.restFun(1,"s","test");
			expect(res).toEqual([1,"s","test"]);
		});
		it("test Event Dispatcher",function(){
			const d = new EventDispatcher();
			d.addEventListener('eee',function(e){
				e.data={"name":'event'};
			});
			const event = new Event('eee');
			d.dispatchEvent(event);
			expect({"name":'event'}).toEqual(event.data);
		});
		it("test System.getQualifiedObjectName",function(){
			expect('Test').toEqual(System.getQualifiedObjectName(_this));
			expect('String').toEqual(System.getQualifiedObjectName(new String('')));
			expect('Test').toEqual(System.getQualifiedClassName(Test));
			expect('[Class Test]').toEqual(Test + '');
		});
		this.testEnumerableProperty();
		this.testComputeProperty();
		this.testLabel();
		this.testEnum();
		this.testIterator();
		this.testGenerics();
		this.testAwait();
		this.testTuple();
		this.next();
	}};
	members.onClick={m:1,d:3,value:function onClick(){
	
	}};
	members.jsx={m:1,d:3,value:function jsx(){
		var b = new Skin();
		var com = (function(){
			var com_Person = __MODULE__.require(0);
			var Class = __MODULE__.require(1);
			var _private=Symbol("private");
			function Person(){
					com_Person.call(this);
			}
			var members = {};
			members.name={m:3,d:4,enumerable:true,get:function name(){
					return 'sss';
				},set:function name(value){
	
				}};
			members.render={m:3,d:3,value:function render(createElement){
					return createElement('span',null, [
							'ssssssssss'
						]);
				}};
			Class.creator(null,Person,{
				'id':1,
				'ns':'',
				'name':'Person',
				'private':_private,
				'inherit':com_Person,
				'members':members
			});
			return Person;
		}());
		return 	createElement('div',{
				"on":{
					"click":this.onClick
					},
				"class":"my",
				"style":{"color":'red'}
				}, [
				createElement('div',null, [
					'child'
				])
			]);
	}};
	members.render={m:3,d:3,value:function render(){
	
	}};
	members.testEnumerableProperty={m:1,d:3,value:function testEnumerableProperty(){
		var _this = this;
		it("for( var name in this) should is this or object ",function(){
			var labels = ["name","data","target","addressName","iuuu"];
			for(var key in _this){
				expect(key).toBe(labels[labels.indexOf(key)]);
				expect(Reflect.get(Test,_this,key)).toBe(Reflect.get(Test,_this,key));
			}
		});
	}};
	members.testComputeProperty={m:1,d:3,value:function testComputeProperty(){
		var bname = "123";
		var _c1,_c,o = (_c={},
			_c[bname]=1,
			_c[sssss]=2,
			_c.uuu=(_c1={},
				_c1[bname]=3,
				_c1),
			_c);
		it("compute property should is true ",function(){
			expect(o[bname]).toBe(1);
			expect(o.uuu[bname]).toBe(3);
			expect(o.uuu["123"]).toBe(3);
			Reflect.set(Test,o["uuu"],bname,true);
			expect(Reflect.get(Test,o["uuu"],bname)).toBe(true);
		});
	}};
	members.testLabel={m:1,d:3,value:function testLabel(){
		var num = 0;
		start:for(var i = 0;i < 5;i++){
			for(var j = 0;j < 5;j++){
				if(i == 3 && j == 3){
					break start;
				}
				num++;
			}
		}
		it("label for should is loop 18",function(){
			expect(num).toBe(18);
		});
	}};
	members.testEnum={m:1,d:3,value:function testEnum(){
		var Type = (Type={},Type[Type["address"]=5]="address",Type[Type["name"]=6]="name",Type);
		const s = Types;
		const t = Type.address;
		const b = Types.ADDRESS;
		it("Type local enum should is true",function(){
			expect(t).toBe(5);
			expect(Type.name).toBe(6);
		});
		it("Type local enum should is true",function(){
			expect(b).toBe(0);
			expect(Types.NAME).toBe(1);
		});
	}};
	members.testIterator={m:1,d:3,value:function testIterator(){
		var array = [];
		for(var val,_v,_i=System.getIterator(this); _i && (_v=_i.next()) && !_v.done;){
			val=_v.value;
			array.push(val);
		}
		it("impls iterator should is [0,1,2,3,4]",function(){
			expect(5).toBe(array.length);
			for(var i = 0;i < 5;i++){
				expect(i).toBe(array[i]);
			}
		});
	}};
	members.testGenerics={m:1,d:3,value:function testGenerics(){
		var _this = this;
		const ddee = this.map();
		const dd = ddee;
		var ccc = ddee.name({"name":1,"age":1},"123");
		var cccww = dd.name({"name":1,"age":30},666);
		var types = '333';
		var _c2,bds = (_c2={},
			_c2.name=123,
			_c2[types]=1,
			_c2);
		Reflect.set(Test,bds,types,99);
		it("Generics should is true",function(){
			expect(typeof _this.avg("test")).toBe('string');
			expect(ccc.name.toFixed(2)).toBe("1.00");
			expect(cccww.age).toBe(30);
		});
		it("class Generics",function(){
			let obj = _this.getTestObject(true);
			var bd = obj;
			var bs = obj.getNamess(1);
			expect(bs.toFixed(2)).toBe("1.00");
		});
		var bsint = this.getTestGenerics('sssss');
		var bsstring = this.getTestGenerics("ssss",'age');
		var bd = bsstring;
		let obj = this.getTestObject(true);
		var bsddd = obj.getNamess(1);
		var sss = obj.getClassTestGenerics(1,1);
	}};
	members.getClassTestGenerics={m:1,d:3,value:function getClassTestGenerics(name,age){
		var a = [age,name];
		return a;
	}};
	members.getTestGenerics={m:1,d:3,value:function getTestGenerics(name,age){
		var t = new Test('name',name);
		return age;
	}};
	members.getTestObject={m:1,d:3,value:function getTestObject(flag){
		const factor = function(){
			const o = {};
			o.test=new Test('name',1);
			o.name="test";
			return o.test;
		};
		var o = factor();
		return o;
	}};
	members.getNamess={m:3,d:3,value:function getNamess(s){
		return s;
	}};
	members.testAwait={m:1,d:3,value:function testAwait(){
		var _this = this;
		it("test Await",function(done){
			const res = _this.loadRemoteData(1);
			res.then(function(data){
				expect(Reflect.get(Test,data,0)).toEqual(['one',1]);
				expect(Reflect.get(Test,data,1)).toEqual({"bss":['two',2],"cc":['three',3]});
				expect(Reflect.get(Test,data,2)).toEqual(['three',3]);
				done();
			});
		});
		it("test for Await",function(done){
			const res = _this.loadRemoteData(2);
			res.then(function(data){
				expect(Reflect.get(Test,data,0)).toEqual(['0',0]);
				expect(Reflect.get(Test,data,1)).toEqual(['1',1]);
				expect(Reflect.get(Test,data,2)).toEqual(['2',2]);
				expect(Reflect.get(Test,data,3)).toEqual(['3',3]);
				expect(Reflect.get(Test,data,4)).toEqual(['4',4]);
				done();
			});
		});
		it("test switch Await",function(done){
			const res = _this.loadRemoteData(3);
			res.then(function(data){
				expect(data).toEqual(['four',4]);
				done();
			});
		});
		it("test switch and for Await",function(done){
			const res = _this.loadRemoteData(4);
			res.then(function(data){
				expect(data).toEqual([['five',5],['0',0],['1',1],['2',2],['3',3],['4',4]]);
				done();
			});
		});
		Reflect.get(Test,this.getJson(),"name");
	}};
	members.getJson={m:3,d:3,value:function getJson(){
		return {"name":123};
	}};
	members.testTuple={m:3,d:3,value:function testTuple(){
		const data = this.method("end",9);
		it("test tuple",function(){
			expect(data).toEqual([['a','b'],[1],[1,1,'one'],['one',['one',1],'three','four',['end',9]]]);
		});
	}};
	members.len={m:1,d:2,value:5};
	members.currentIndex={m:1,d:1,writable:true,value:0};
	members.next={m:3,d:3,value:function next(){
		if(!(this[_private].currentIndex < this[_private].len)){
			return {"value":null,"done":true};
		}
		const d = {"value":this[_private].currentIndex++,"done":false};
		return d;
	}};
	members.rewind={m:3,d:3,value:function rewind(){
		this[_private].currentIndex=0;
	}};
	members.restFun={m:3,d:3,value:function restFun(){
		var types = Array.prototype.slice.call(arguments,0);
		return types;
	}};
	members.tetObject={m:3,d:3,value:function tetObject(){
		var t = new Test('1',1);
		var b = t;
		var ii = {"bb":b};
		return ii.bb;
	}};
	members.loadData={m:3,d:3,value:function loadData(){
	
	}};
	members.iuuu={m:3,d:4,enumerable:true,get:function iuuu(){
		var ii = this.name;
		if(6){
			ii=[];
		}
		ii=true;
		return ii;
	}};
	members.data={m:3,d:4,enumerable:true,get:function data(){
		var b = [];
		if(4){
			b=this.avg;
		}
		b=this.avg;
		const dd = function(){
			var bs = new Promise(function(resolve,reject){
				setTimeout(function(){
					resolve([]);
				},100);
			});
			return bs;
		};
		return b;
	}};
	members.fetchApi={m:3,d:3,value:function fetchApi(name,data,delay){
		return new Promise(function(resolve,reject){
			setTimeout(function(){
				resolve([name,data]);
			},delay);
		});
	}};
	members.loadRemoteData2={m:3,d:3,value:function loadRemoteData2(){
	
		return System.awaiter(this, void 0, void 0, function (){
	
			return System.generator(this, function (_a) {
				switch (_a.label){
					case 0 :
						return [4,this.fetchApi("one",1,800)];
					case 1:
						return [2, _a.sent()];
	
				}
			});
		});
	}};
	members.loadRemoteData={m:3,d:3,value:function loadRemoteData(type){
	
		return System.awaiter(this, void 0, void 0, function (){
			var a;
			var bs;
			var c;
			var list;
			var b;
			var bb;
					var i;
			return System.generator(this, function (_a) {
				switch (_a.label){
					case 0 :
						if(!(type === 1))return [3,4];
						return [4,this.fetchApi("one",1,800)];
					case 1:
						a = _a.sent();
						return [4,this.fetchApi("two",2,500)];
					case 2:
						bs = {"bss":_a.sent()};
						return [4,this.fetchApi("three",3,900)];
					case 3:
						c = _a.sent();
						bs.cc=c;
						return [2, [a,bs,c]];
					case 4:
						list = [];
						switch(type){
							case 3 : return [3,5];
							case 4 : return [3,7];
						}
						return [3,9];
					case 5:
						return [4,this.fetchApi("four",4,300)];
					case 6:
						b = _a.sent();
						return [2, b];
					case 7:
						return [4,this.fetchApi("five",5,1200)];
					case 8:
						bb = _a.sent();
						list.push(bb);
						return [3,9];
					case 9:
						i=0;
						_a.label=10;
					case 10:
						if( !(i < 5) )return [3, 13];
						return [4,this.fetchApi(i + '',i,100)];
					case 11:
						list.push(_a.sent());
						_a.label=12;
					case 12:
						i++;
						return [3, 10];
					case 13:
						list.entries();
						return [2, list];
	
				}
			});
		});
	}};
	members.method={m:3,d:3,value:function method(name,age){
		Person.prototype.method.call(this,name,age);
		var str = ["a","b"];
		var b = ["one",["one",1]];
		var cc = [1];
		var x = [1,1,'one'];
		b.push('three');
		b.push('four');
		b.push([name,age]);
		return [str,cc,x,b];
	}};
	members.name={m:3,d:4,enumerable:true,get:function name(){
		return Person[Class.key].members.name.get.call(this);
	},set:function name(value){
		Person[Class.key].members.name.set.call(this,value);
	}};
	members.avg={m:3,d:3,value:function avg(yy,bbc){
		var ii = function(){
		return 1;
		};
		var bb = ['1'];
		function name(i){
			var b = i;
			i.avg();
			i.method('',1);
			return b;
		}
		const person = new Person('');
		name(person);
		const bbb = name(person);
		name(person);
		var dd = [1,1,"2222","66666","8888"];
		bb.push();
		dd.push(1);
		return yy;
	}};
	members.map={m:3,d:3,value:function map(){
		const ddss = {"name":function(c,b){
			var id = b;
			return c;
		}};
		return ddss;
	}};
	members.address={m:1,d:3,value:function address(){
		const dd = [];
		const bb = {"global":1,"private":1};
		dd.push(1);
		return dd;
	}};
	members[Symbol.iterator]={value:function(){return this;}}
	Class.creator(10,Test,{
		'id':1,
		'ns':'',
		'name':'Test',
		'private':_private,
		'inherit':Person,
		'methods':methods,
		'members':members
	});
	__MODULE__.exports=Test;
	/*externals code*/;
	(function(){
		var Test = Class.require(10);
		const test = new Test('Test');
		test.start();
	}());
}
}));